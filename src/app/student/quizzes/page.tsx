"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface QuizItem {
  _id: string;
  title: string;
  courseTitle: string;
  durationMinutes: number;
  totalMarks: number;
  questionCount: number;
  attempted: boolean;
  score?: number;
  percentage?: number;
}

async function fetchQuizzes(): Promise<QuizItem[]> {
  const res = await fetch("/api/student/quizzes");
  if (!res.ok) throw new Error("Failed to load quizzes");
  return res.json();
}

export default function StudentQuizzesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["student-quizzes"], queryFn: fetchQuizzes });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <Card className="glass-strong border-0">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">No quizzes available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {data.map((quiz) => (
        <Card key={quiz._id} className="glass border-0">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <h3 className="font-semibold">{quiz.title}</h3>
              <p className="text-sm text-muted-foreground">
                {quiz.courseTitle} &middot; {quiz.questionCount} questions &middot; {quiz.durationMinutes} min &middot;{" "}
                {quiz.totalMarks} marks
              </p>
            </div>
            {quiz.attempted ? (
              <Badge variant="default">Scored {quiz.percentage}%</Badge>
            ) : (
              <Button asChild size="sm" className="brand-gradient-bg border-0 text-white">
                <Link href={`/student/quizzes/${quiz._id}/take`}>Start quiz</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
