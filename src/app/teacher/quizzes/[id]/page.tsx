"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AnswerDetail {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  selectedOptionIndex: number | null;
  isCorrect: boolean;
  marks: number;
}

interface StudentResult {
  studentId: string;
  fullName: string;
  email: string;
  attempted: boolean;
  score: number | null;
  percentage: number | null;
  submittedAt: string | null;
  answers: AnswerDetail[];
}

interface QuizResultsData {
  quiz: { title: string; totalMarks: number; questionCount: number };
  students: StudentResult[];
}

async function fetchResults(id: string): Promise<QuizResultsData> {
  const res = await fetch(`/api/teacher/quizzes/${id}/results`);
  if (!res.ok) throw new Error("Failed to load quiz results");
  return res.json();
}

function StudentRow({ student, totalMarks }: { student: StudentResult; totalMarks: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="glass border-0">
      <CardContent className="p-4">
        <button
          className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
          onClick={() => student.attempted && setExpanded((e) => !e)}
        >
          <div>
            <p className="font-medium">{student.fullName}</p>
            <p className="text-xs text-muted-foreground">{student.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {student.attempted ? (
              <>
                <div className="text-right text-sm">
                  <p className="font-medium">{student.score} / {totalMarks}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.percentage}% &middot; {format(new Date(student.submittedAt!), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
                {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </>
            ) : (
              <Badge variant="outline">Not attempted</Badge>
            )}
          </div>
        </button>

        {expanded && student.attempted && (
          <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
            {student.answers.map((a, i) => (
              <div key={i} className="space-y-1 rounded-lg border border-border/60 p-3 text-sm">
                <p className="font-medium">{i + 1}. {a.questionText}</p>
                <div className="space-y-1">
                  {a.options.map((opt, optIndex) => (
                    <p
                      key={optIndex}
                      className={cn(
                        "rounded px-2 py-1 text-xs",
                        optIndex === a.correctOptionIndex && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                        optIndex === a.selectedOptionIndex && optIndex !== a.correctOptionIndex && "bg-destructive/10 text-destructive"
                      )}
                    >
                      {opt}
                      {optIndex === a.correctOptionIndex && " (correct)"}
                      {optIndex === a.selectedOptionIndex && optIndex !== a.correctOptionIndex && " (selected)"}
                    </p>
                  ))}
                  {a.selectedOptionIndex === null && (
                    <p className="text-xs text-muted-foreground">No answer selected</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TeacherQuizResultsPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-quiz-results", params.id],
    queryFn: () => fetchResults(params.id),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <Card className="glass-strong border-0">
        <CardHeader>
          <CardTitle>{data.quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {data.quiz.questionCount} questions &middot; Total marks {data.quiz.totalMarks}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Students ({data.students.length})
        </h2>
        {data.students.length === 0 && (
          <p className="text-sm text-muted-foreground">No students enrolled in this course yet.</p>
        )}
        {data.students.map((s) => (
          <StudentRow key={s.studentId} student={s} totalMarks={data.quiz.totalMarks} />
        ))}
      </div>
    </div>
  );
}
