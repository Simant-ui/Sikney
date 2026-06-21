"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultItem {
  _id: string;
  student: { fullName: string; email: string };
  quizTitle: string;
  courseTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  submittedAt: string;
}

async function fetchResults(): Promise<ResultItem[]> {
  const res = await fetch("/api/teacher/results");
  if (!res.ok) throw new Error("Failed to load results");
  return res.json();
}

export default function TeacherResultsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["teacher-results"], queryFn: fetchResults });

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
            <Award className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">No quiz attempts yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {data.map((r) => (
        <Card key={r._id} className="glass border-0">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-semibold">{r.student.fullName}</h3>
              <p className="text-sm text-muted-foreground">
                {r.quizTitle} &middot; {r.courseTitle} &middot; {format(new Date(r.submittedAt), "MMM d, yyyy")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{r.percentage}%</p>
              <p className="text-xs text-muted-foreground">{r.score} / {r.totalMarks}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
