"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface NoteItem {
  _id: string;
  title: string;
  courseTitle: string;
  fileUrl: string;
  createdAt: string;
}

async function fetchNotes(): Promise<NoteItem[]> {
  const res = await fetch("/api/student/notes");
  if (!res.ok) throw new Error("Failed to load notes");
  return res.json();
}

export default function StudentNotesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["student-notes"], queryFn: fetchNotes });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <Card className="glass-strong border-0">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {data.map((n) => (
        <a key={n._id} href={n.fileUrl} target="_blank" rel="noreferrer">
          <Card className="glass border-0 transition-colors hover:bg-muted/40">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{n.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {n.courseTitle} &middot; Added {format(new Date(n.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </a>
      ))}
    </motion.div>
  );
}
