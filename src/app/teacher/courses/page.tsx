"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PlusCircle, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  isPublished: boolean;
  studentsEnrolledCount: number;
}

async function fetchCourses(): Promise<CourseItem[]> {
  const res = await fetch("/api/teacher/courses");
  if (!res.ok) throw new Error("Failed to load courses");
  return res.json();
}

export default function TeacherCoursesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["teacher-courses"], queryFn: fetchCourses });

  async function togglePublish(id: string, isPublished: boolean) {
    const res = await fetch(`/api/teacher/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished }),
    });
    if (!res.ok) {
      toast.error("Could not update course");
      return;
    }
    toast.success(isPublished ? "Course published" : "Course unpublished");
    queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage your courses and publish them to students.</p>
        <Button asChild className="brand-gradient-bg border-0 text-white">
          <Link href="/teacher/courses/new">
            <PlusCircle className="size-4" /> New course
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && data?.length === 0 && (
        <Card className="glass-strong border-0">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">You haven&apos;t created any courses yet.</p>
            <Button asChild className="brand-gradient-bg border-0 text-white">
              <Link href="/teacher/courses/new">Create your first course</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {data?.map((course) => (
          <Card key={course._id} className="glass border-0">
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight">{course.title}</h3>
                <Badge variant={course.isPublished ? "default" : "secondary"} className="shrink-0">
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="capitalize">{course.level}</Badge>
                <span>{course.category}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-sm text-muted-foreground">
                  {course.studentsEnrolledCount} student{course.studentsEnrolledCount === 1 ? "" : "s"}
                </span>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Publish
                  <Switch
                    checked={course.isPublished}
                    onCheckedChange={(checked) => togglePublish(course._id, checked)}
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
