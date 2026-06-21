"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createQuizSchema, type CreateQuizInput } from "@/lib/validations";

interface CourseOption {
  _id: string;
  title: string;
}

async function fetchCourses(): Promise<CourseOption[]> {
  const res = await fetch("/api/teacher/courses");
  if (!res.ok) throw new Error("Failed to load courses");
  return res.json();
}

export default function NewQuizPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: courses } = useQuery({ queryKey: ["teacher-courses"], queryFn: fetchCourses });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
  } = useForm<CreateQuizInput>({
    defaultValues: {
      courseId: "",
      title: "",
      durationMinutes: 15,
      isPublished: true,
      questions: [{ questionText: "", options: ["", ""], correctOptionIndex: 0, marks: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "questions" });
  const courseId = watch("courseId");

  const onSubmit = async (rawData: CreateQuizInput) => {
    const payload = {
      ...rawData,
      questions: rawData.questions.map((q) => ({
        ...q,
        options: q.options.map((o) => o.trim()).filter(Boolean),
      })),
    };

    const parsed = createQuizSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the quiz form");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/teacher/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Could not create quiz");
        return;
      }
      toast.success("Quiz created");
      router.push("/teacher/quizzes");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl">
      <Card className="glass-strong border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Create quiz</CardTitle>
          <CardDescription>Add MCQ questions with a timer. Grading is automatic.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={courseId} onValueChange={(v) => setValue("courseId", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz title</Label>
                <Input id="title" {...register("title")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min={1}
                  {...register("durationMinutes", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-4">
              {fields.map((field, qIndex) => (
                <Card key={field.id} className="border border-border/60">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Question {qIndex + 1}</p>
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(qIndex)} aria-label="Remove question">
                          <Trash2 className="size-4 text-destructive" />
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder="Question text"
                      {...register(`questions.${qIndex}.questionText` as const)}
                    />

                    <div className="space-y-2">
                      {[0, 1, 2, 3].map((optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={watch(`questions.${qIndex}.correctOptionIndex`) === optIndex}
                            onChange={() => setValue(`questions.${qIndex}.correctOptionIndex`, optIndex)}
                            aria-label={`Mark option ${optIndex + 1} correct`}
                          />
                          <Input
                            placeholder={`Option ${optIndex + 1}${optIndex < 2 ? " (required)" : " (optional)"}`}
                            {...register(`questions.${qIndex}.options.${optIndex}` as const)}
                          />
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer.</p>
                    </div>

                    <div className="w-32 space-y-1">
                      <Label className="text-xs">Marks</Label>
                      <Input
                        type="number"
                        min={1}
                        {...register(`questions.${qIndex}.marks` as const, { valueAsNumber: true })}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ questionText: "", options: ["", ""], correctOptionIndex: 0, marks: 1 })}
              >
                <Plus className="size-4" /> Add question
              </Button>
            </div>

            <Button type="submit" className="w-full brand-gradient-bg border-0 text-white" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Create quiz
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
