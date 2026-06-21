"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, isPast } from "date-fns";
import { ClipboardCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUploadField } from "@/components/shared/file-upload-field";

interface AssignmentItem {
  _id: string;
  title: string;
  courseTitle: string;
  instructions: string;
  attachmentUrl?: string;
  dueDate: string;
  maxMarks: number;
  submission: { status: "pending" | "graded"; marksObtained?: number; feedback?: string; fileUrl: string } | null;
}

async function fetchAssignments(): Promise<AssignmentItem[]> {
  const res = await fetch("/api/student/assignments");
  if (!res.ok) throw new Error("Failed to load assignments");
  return res.json();
}

function AssignmentCard({ assignment }: { assignment: AssignmentItem }) {
  const queryClient = useQueryClient();
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const overdue = isPast(new Date(assignment.dueDate)) && !assignment.submission;

  async function handleSubmit() {
    if (!fileUrl) {
      toast.error("Upload a file first");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/student/assignments/${assignment._id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Could not submit");
        return;
      }
      toast.success("Assignment submitted");
      queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="glass border-0">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{assignment.title}</h3>
            <p className="text-xs text-muted-foreground">{assignment.courseTitle}</p>
          </div>
          {assignment.submission ? (
            <Badge variant={assignment.submission.status === "graded" ? "default" : "secondary"}>
              {assignment.submission.status === "graded" ? "Graded" : "Submitted"}
            </Badge>
          ) : overdue ? (
            <Badge variant="destructive">Overdue</Badge>
          ) : (
            <Badge variant="outline">Pending</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{assignment.instructions}</p>
        <p className="text-xs text-muted-foreground">
          Due {format(new Date(assignment.dueDate), "MMM d, yyyy h:mm a")} &middot; Max marks {assignment.maxMarks}
        </p>

        {assignment.submission?.status === "graded" && (
          <div className="rounded-lg bg-emerald-500/10 p-3 text-sm">
            <p className="font-medium text-emerald-700 dark:text-emerald-400">
              Score: {assignment.submission.marksObtained} / {assignment.maxMarks}
            </p>
            {assignment.submission.feedback && (
              <p className="mt-1 text-muted-foreground">{assignment.submission.feedback}</p>
            )}
          </div>
        )}

        {!assignment.submission && (
          <div className="space-y-2 border-t border-border/60 pt-3">
            <FileUploadField value={fileUrl} onChange={setFileUrl} folder="submissions" label="Upload your work" />
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || !fileUrl}
              className="brand-gradient-bg border-0 text-white"
            >
              Submit assignment
            </Button>
          </div>
        )}

        {assignment.submission && assignment.submission.status === "pending" && (
          <a
            href={assignment.submission.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary hover:underline"
          >
            View your submission
          </a>
        )}
      </CardContent>
    </Card>
  );
}

export default function StudentAssignmentsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["student-assignments"], queryFn: fetchAssignments });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <Card className="glass-strong border-0">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardCheck className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">No assignments yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {data.map((a) => (
        <AssignmentCard key={a._id} assignment={a} />
      ))}
    </motion.div>
  );
}
