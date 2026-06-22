"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { PlusCircle, FileText, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface NoteItem {
  _id: string;
  title: string;
  courseTitle: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
}

async function fetchNotes(): Promise<NoteItem[]> {
  const res = await fetch("/api/teacher/notes");
  if (!res.ok) throw new Error("Failed to load notes");
  return res.json();
}

export default function TeacherNotesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["teacher-notes"], queryFn: fetchNotes });

  async function handleDelete(id: string) {
    const res = await fetch(`/api/teacher/notes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete note");
      return;
    }
    toast.success("Note deleted");
    queryClient.invalidateQueries({ queryKey: ["teacher-notes"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Upload notes and PDFs for your courses.</p>
        <Button asChild className="brand-gradient-bg border-0 text-white">
          <Link href="/teacher/notes/new">
            <PlusCircle className="size-4" /> New note
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && data?.length === 0 && (
        <Card className="glass-strong border-0">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          </CardContent>
        </Card>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        {data?.map((n) => (
          <Card key={n._id} className="glass border-0">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <h3 className="font-semibold">{n.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {n.courseTitle} &middot; Added {format(new Date(n.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a href={n.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                  View file
                </a>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(n._id)} aria-label="Delete note">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
