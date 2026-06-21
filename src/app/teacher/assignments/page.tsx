"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { PlusCircle, ClipboardCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AssignmentItem {
  _id: string;
  title: string;
  courseTitle: string;
  dueDate: string;
  maxMarks: number;
  isPublished: boolean;
  submissionCount: number;
  pendingCount: number;
}

async function fetchAssignments(): Promise<AssignmentItem[]> {
  const res = await fetch("/api/teacher/assignments");
  if (!res.ok) throw new Error("Failed to load assignments");
  return res.json();
}

export default function TeacherAssignmentsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["teacher-assignments"], queryFn: fetchAssignments });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Create assignments and review submissions.</p>
        <Button asChild className="brand-gradient-bg border-0 text-white">
          <Link href="/teacher/assignments/new">
            <PlusCircle className="size-4" /> New assignment
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
              <ClipboardCheck className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">No assignments yet.</p>
          </CardContent>
        </Card>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        {data?.map((a) => (
          <Link key={a._id} href={`/teacher/assignments/${a._id}`}>
            <Card className="glass border-0 transition-colors hover:bg-muted/40">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{a.title}</h3>
                    <Badge variant={a.isPublished ? "default" : "secondary"}>
                      {a.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {a.courseTitle} &middot; Due {format(new Date(a.dueDate), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{a.submissionCount} submitted</p>
                  {a.pendingCount > 0 && (
                    <p className="text-amber-600 dark:text-amber-400">{a.pendingCount} pending grade</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
