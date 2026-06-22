"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface NotificationItem {
  _id: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch("/api/notifications");
  if (!res.ok) throw new Error("Failed to load notifications");
  return res.json();
}

export function NotificationList() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 15000,
  });

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <Card className="glass-strong border-0">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bell className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      {data.map((n) => (
        <Card
          key={n._id}
          className={cn("glass border-0 cursor-pointer transition-colors", !n.isRead && "bg-primary/5")}
          onClick={() => !n.isRead && markRead(n._id)}
        >
          <CardContent className="flex items-start gap-3 p-4">
            {!n.isRead && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
            <div className="flex-1 space-y-0.5">
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.body}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(n.createdAt), "MMM d, yyyy h:mm a")}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
