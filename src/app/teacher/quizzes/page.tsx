"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PlusCircle, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

interface QuizItem {
  _id: string;
  title: string;
  courseTitle: string;
  durationMinutes: number;
  questionCount: number;
  totalMarks: number;
  isPublished: boolean;
  attemptCount: number;
  avgPercentage: number;
}

async function fetchQuizzes(): Promise<QuizItem[]> {
  const res = await fetch("/api/teacher/quizzes");
  if (!res.ok) throw new Error("Failed to load quizzes");
  return res.json();
}

export default function TeacherQuizzesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["teacher-quizzes"], queryFn: fetchQuizzes });

  async function togglePublish(id: string, isPublished: boolean) {
    const res = await fetch(`/api/teacher/quizzes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished }),
    });
    if (!res.ok) {
      toast.error("Could not update quiz");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["teacher-quizzes"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Create quizzes with auto-grading.</p>
        <Button asChild className="brand-gradient-bg border-0 text-white">
          <Link href="/teacher/quizzes/new">
            <PlusCircle className="size-4" /> New quiz
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
              <ClipboardList className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">No quizzes yet.</p>
          </CardContent>
        </Card>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        {data?.map((quiz) => (
          <Card key={quiz._id} className="glass border-0">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{quiz.title}</h3>
                  <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                    {quiz.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {quiz.courseTitle} &middot; {quiz.questionCount} questions &middot; {quiz.durationMinutes} min
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-sm">
                  <p className="font-medium">{quiz.attemptCount} attempts</p>
                  {quiz.attemptCount > 0 && <p className="text-muted-foreground">Avg {quiz.avgPercentage}%</p>}
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Publish
                  <Switch
                    checked={quiz.isPublished}
                    onCheckedChange={(checked) => togglePublish(quiz._id, checked)}
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
