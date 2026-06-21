"use client";

import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SubmissionItem {
  _id: string;
  studentId: { fullName: string; email: string };
  fileUrl: string;
  status: "pending" | "graded";
  marksObtained?: number;
  feedback?: string;
  submittedAt: string;
}

interface AssignmentDetail {
  assignment: { title: string; instructions: string; maxMarks: number; dueDate: string };
  submissions: SubmissionItem[];
}

async function fetchDetail(id: string): Promise<AssignmentDetail> {
  const res = await fetch(`/api/teacher/assignments/${id}/submissions`);
  if (!res.ok) throw new Error("Failed to load");
  return res.json();
}

function GradeRow({ submission, maxMarks, assignmentId }: { submission: SubmissionItem; maxMarks: number; assignmentId: string }) {
  const queryClient = useQueryClient();
  const [marks, setMarks] = useState(submission.marksObtained?.toString() ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function saveGrade() {
    const marksNumber = Number(marks);
    if (Number.isNaN(marksNumber) || marksNumber < 0 || marksNumber > maxMarks) {
      toast.error(`Marks must be between 0 and ${maxMarks}`);
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/teacher/submissions/${submission._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marksObtained: marksNumber, feedback }),
      });
      if (!res.ok) {
        toast.error("Could not save grade");
        return;
      }
      toast.success("Grade saved");
      queryClient.invalidateQueries({ queryKey: ["teacher-assignment-detail", assignmentId] });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="glass border-0">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{submission.studentId.fullName}</p>
            <p className="text-xs text-muted-foreground">{submission.studentId.email}</p>
          </div>
          <Badge variant={submission.status === "graded" ? "default" : "secondary"}>
            {submission.status === "graded" ? "Graded" : "Pending"}
          </Badge>
        </div>
        <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
          View submission
        </a>
        <div className="grid grid-cols-[100px_1fr] gap-3">
          <Input
            type="number"
            min={0}
            max={maxMarks}
            placeholder={`/ ${maxMarks}`}
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
          />
          <Textarea
            placeholder="Feedback (optional)"
            rows={1}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={saveGrade} disabled={isSaving} className="brand-gradient-bg border-0 text-white">
          Save grade
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-assignment-detail", params.id],
    queryFn: () => fetchDetail(params.id),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <Card className="glass-strong border-0">
        <CardHeader>
          <CardTitle>{data.assignment.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>{data.assignment.instructions}</p>
          <p>
            Due {format(new Date(data.assignment.dueDate), "MMM d, yyyy h:mm a")} &middot; Max marks{" "}
            {data.assignment.maxMarks}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Submissions ({data.submissions.length})</h2>
        {data.submissions.length === 0 && (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        )}
        {data.submissions.map((s) => (
          <GradeRow key={s._id} submission={s} maxMarks={data.assignment.maxMarks} assignmentId={params.id} />
        ))}
      </div>
    </div>
  );
}
