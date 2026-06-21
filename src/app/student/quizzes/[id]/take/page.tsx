"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface QuizQuestion {
  questionText: string;
  options: string[];
  marks: number;
}

interface QuizDetail {
  _id: string;
  title: string;
  durationMinutes: number;
  questions: QuizQuestion[];
}

interface ResultSummary {
  score: number;
  totalMarks: number;
  percentage: number;
}

export default function TakeQuizPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ResultSummary | null>(null);
  const startedAtRef = useRef<string>(new Date().toISOString());
  const submittedRef = useRef(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/student/quizzes/${params.id}`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Could not load quiz");
        router.push("/student/quizzes");
        return;
      }
      setQuiz(json);
      setSecondsLeft(json.durationMinutes * 60);
      startedAtRef.current = new Date().toISOString();
      setIsLoading(false);
    }
    load();
  }, [params.id, router]);

  const submit = useMemo(
    () => async () => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setIsSubmitting(true);
      try {
        const payload = {
          startedAt: startedAtRef.current,
          answers: Object.entries(answers).map(([questionIndex, selectedOptionIndex]) => ({
            questionIndex: Number(questionIndex),
            selectedOptionIndex,
          })),
        };
        const res = await fetch(`/api/student/quizzes/${params.id}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Could not submit quiz");
          submittedRef.current = false;
          return;
        }
        setResult({ score: json.score, totalMarks: json.totalMarks, percentage: json.percentage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [answers, params.id]
  );

  useEffect(() => {
    if (isLoading || result) return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, isLoading, result, submit]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="glass-strong border-0">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-7" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Quiz submitted!</h2>
              <p className="mt-2 text-3xl font-bold">{result.percentage}%</p>
              <p className="text-sm text-muted-foreground">
                {result.score} / {result.totalMarks} marks
              </p>
            </div>
            <Button onClick={() => router.push("/student/results")} className="brand-gradient-bg border-0 text-white">
              View all results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="glass-strong border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{quiz.title}</CardTitle>
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            <Clock className="size-4" />
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </CardHeader>
      </Card>

      {quiz.questions.map((question, qIndex) => (
        <Card key={qIndex} className="glass border-0">
          <CardContent className="space-y-3 p-5">
            <p className="font-medium">
              {qIndex + 1}. {question.questionText}{" "}
              <span className="text-xs text-muted-foreground">({question.marks} marks)</span>
            </p>
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <label
                  key={optIndex}
                  className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm hover:bg-muted/50"
                >
                  <input
                    type="radio"
                    name={`q-${qIndex}`}
                    checked={answers[qIndex] === optIndex}
                    onChange={() => setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }))}
                  />
                  {option}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={submit} disabled={isSubmitting} className="w-full brand-gradient-bg border-0 text-white">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Submit quiz
      </Button>
    </div>
  );
}
