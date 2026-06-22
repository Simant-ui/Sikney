"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function buildConversationId(a: string, b: string) {
  return [a, b].sort().join("_");
}

interface Conversation {
  conversationId: string;
  otherUser: { _id: string; fullName: string; avatarUrl?: string; role?: string };
  lastMessage: { content?: string; createdAt: string; senderId: string };
  unreadCount: number;
  courseId: string | null;
}

interface MessageItem {
  _id: string;
  senderId: string;
  receiverId: string;
  content?: string;
  courseId?: string;
  createdAt: string;
}

async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch("/api/messages");
  if (!res.ok) throw new Error("Failed to load conversations");
  return res.json();
}

async function fetchThread(conversationId: string): Promise<MessageItem[]> {
  const res = await fetch(`/api/messages/${conversationId}`);
  if (!res.ok) throw new Error("Failed to load thread");
  return res.json();
}

export function MessageThread({ role }: { role: "student" | "teacher" }) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const myId = session?.user?.id;

  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [newConversationCourseId, setNewConversationCourseId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());

  const { data: conversations } = useQuery({ queryKey: ["messages"], queryFn: fetchConversations });

  useEffect(() => {
    const to = searchParams.get("to");
    if (to) {
      setOtherUserId(to);
      setNewConversationCourseId(searchParams.get("courseId"));
    }
  }, [searchParams]);

  const conversationId = myId && otherUserId ? buildConversationId(myId, otherUserId) : null;
  const { data: thread } = useQuery({
    queryKey: ["message-thread", conversationId],
    queryFn: () => fetchThread(conversationId!),
    enabled: Boolean(conversationId),
  });

  const activeConversation = conversations?.find((c) => c.otherUser._id === otherUserId);
  const otherUserName = activeConversation?.otherUser.fullName ?? "New conversation";
  const threadCourseId = thread?.find((m) => m.courseId)?.courseId ?? newConversationCourseId ?? undefined;

  async function handleSend() {
    if (!draft.trim() || !otherUserId) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: otherUserId,
          content: draft.trim(),
          courseId: thread?.length ? undefined : newConversationCourseId ?? undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Could not send message");
        return;
      }
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["message-thread", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    } finally {
      setIsSending(false);
    }
  }

  async function handleConfirm() {
    if (!otherUserId || !threadCourseId) return;
    setIsConfirming(true);
    try {
      const res = await fetch("/api/teacher/messages/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: otherUserId, courseId: threadCourseId }),
      });
      if (!res.ok) {
        toast.error("Could not confirm enrollment");
        return;
      }
      toast.success("Student enrolled");
      setConfirmedIds((s) => new Set(s).add(conversationId!));
      queryClient.invalidateQueries({ queryKey: ["message-thread", conversationId] });
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]" style={{ minHeight: "60vh" }}>
      <Card className="glass-strong border-0">
        <CardContent className="space-y-1 p-2">
          {!conversations?.length && (
            <p className="p-3 text-sm text-muted-foreground">No conversations yet.</p>
          )}
          {conversations?.map((c) => (
            <button
              key={c.conversationId}
              onClick={() => {
                setOtherUserId(c.otherUser._id);
                setNewConversationCourseId(c.courseId);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg p-2.5 text-left text-sm transition-colors",
                otherUserId === c.otherUser._id ? "bg-primary/10" : "hover:bg-muted"
              )}
            >
              <Avatar className="size-8">
                <AvatarImage src={c.otherUser.avatarUrl} />
                <AvatarFallback>{c.otherUser.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{c.otherUser.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{c.lastMessage.content}</p>
              </div>
              {c.unreadCount > 0 && <Badge className="shrink-0">{c.unreadCount}</Badge>}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-strong flex flex-col border-0">
        {!otherUserId ? (
          <CardContent className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">Select a conversation to view messages.</p>
          </CardContent>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border/60 p-4">
              <h3 className="font-semibold">{otherUserName}</h3>
              {role === "teacher" && threadCourseId && !confirmedIds.has(conversationId ?? "") && (
                <Button size="sm" onClick={handleConfirm} disabled={isConfirming} className="brand-gradient-bg border-0 text-white">
                  Confirm enrollment
                </Button>
              )}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {thread?.map((m) => (
                <div
                  key={m._id}
                  className={cn("flex", m.senderId === myId ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                      m.senderId === myId ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    <p>{m.content}</p>
                    <p className="mt-1 text-[10px] opacity-70">{format(new Date(m.createdAt), "MMM d, h:mm a")}</p>
                  </div>
                </div>
              ))}
              {!thread?.length && (
                <p className="text-sm text-muted-foreground">Say hello to start the conversation.</p>
              )}
            </div>

            <div className="flex items-end gap-2 border-t border-border/60 p-3">
              <Textarea
                rows={1}
                placeholder="Type a message..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button size="icon" onClick={handleSend} disabled={isSending || !draft.trim()}>
                <Send className="size-4" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
