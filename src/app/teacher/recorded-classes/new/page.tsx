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
import { FileUploadField } from "@/components/shared/file-upload-field";
import { createVideoSchema, type CreateVideoInput } from "@/lib/validations";
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

export default function NewRecordedClassPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: courses } = useQuery({ queryKey: ["teacher-courses"], queryFn: fetchCourses });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateVideoInput>({
    resolver: zodResolver(createVideoSchema),
    defaultValues: { courseId: "", title: "", url: "" },
  });

  const courseId = watch("courseId");
  const url = watch("url");

  const onSubmit = async (data: CreateVideoInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/teacher/recorded-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Could not upload recording");
        return;
      }
      toast.success("Recording uploaded");
      router.push("/teacher/recorded-classes");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
      <Card className="glass-strong border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Upload recorded class</CardTitle>
          <CardDescription>Add a video recording for your students to watch anytime.</CardDescription>
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

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Video file</Label>
              <FileUploadField
                value={url}
                onChange={(uploadedUrl) => setValue("url", uploadedUrl)}
                folder="recordings"
                accept="video/*"
              />
              {errors.url && <p className="text-sm text-destructive">{errors.url.message}</p>}
            </div>

            <Button type="submit" className="w-full brand-gradient-bg border-0 text-white" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Upload recording
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
