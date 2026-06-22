"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
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
import { StudentPicker } from "@/components/shared/student-picker";
import { createLiveClassSchema, type CreateLiveClassInput } from "@/lib/validations";
import { Loader2 } from "lucide-react";

interface CourseOption {
  _id: string;
  title: string;
}

async function fetchCourses(): Promise<CourseOption[]> {
  const res = await fetch("/api/teacher/courses");
  if (!res.ok) throw new Error("Failed to load courses");
  return res.json();
}

export default function NewLiveClassPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: courses } = useQuery({ queryKey: ["teacher-courses"], queryFn: fetchCourses });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateLiveClassInput>({
    resolver: zodResolver(createLiveClassSchema),
    defaultValues: {
      courseId: "",
      title: "",
      platform: "zoom",
      joinUrl: "",
      scheduledAt: "",
      durationMinutes: 60,
      studentIds: [],
    },
  });

  const courseId = watch("courseId");
  const platform = watch("platform");
  const studentIds = watch("studentIds") ?? [];

  const onSubmit = async (data: CreateLiveClassInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/teacher/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Could not schedule live class");
        return;
      }
      toast.success("Live class scheduled");
      router.push("/teacher/live-classes");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
      <Card className="glass-strong border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Schedule live class</CardTitle>
          <CardDescription>Share a meeting link for your students to join.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              {errors.courseId && <p className="text-sm text-destructive">{errors.courseId.message}</p>}
            </div>

            {courseId && (
              <div className="space-y-2">
                <Label>Invite specific students (optional)</Label>
                <StudentPicker
                  courseId={courseId}
                  value={studentIds}
                  onChange={(ids) => setValue("studentIds", ids)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(v) => setValue("platform", v as "zoom" | "google-meet")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="google-meet">Google Meet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinUrl">Meeting link</Label>
              <Input id="joinUrl" placeholder="https://zoom.us/j/..." {...register("joinUrl")} />
              {errors.joinUrl && <p className="text-sm text-destructive">{errors.joinUrl.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Date & time</Label>
                <Input id="scheduledAt" type="datetime-local" {...register("scheduledAt")} />
                {errors.scheduledAt && <p className="text-sm text-destructive">{errors.scheduledAt.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Duration (min)</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min={5}
                  {...register("durationMinutes", { valueAsNumber: true })}
                />
                {errors.durationMinutes && (
                  <p className="text-sm text-destructive">{errors.durationMinutes.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full brand-gradient-bg border-0 text-white" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Schedule class
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
