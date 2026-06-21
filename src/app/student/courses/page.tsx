"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  isEnrolled: boolean;
  progressPercent: number;
  teacherId?: { fullName?: string };
}

async function fetchCourses(): Promise<CourseItem[]> {
  const res = await fetch("/api/student/courses");
  if (!res.ok) throw new Error("Failed to load courses");
  return res.json();
}

export default function StudentCoursesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["student-courses"], queryFn: fetchCourses });

  async function enroll(courseId: string) {
    const res = await fetch("/api/student/courses/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error ?? "Could not enroll");
      return;
    }
    toast.success("Enrolled successfully!");
    queryClient.invalidateQueries({ queryKey: ["student-courses"] });
    queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <Card className="glass-strong border-0">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">No courses are available yet. Check back soon.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {data.map((course) => (
        <Card key={course._id} className="glass border-0">
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold leading-tight">{course.title}</h3>
              {course.isEnrolled && <Badge>Enrolled</Badge>}
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="capitalize">{course.level}</Badge>
              <span>{course.category}</span>
            </div>
            {course.teacherId?.fullName && (
              <p className="text-xs text-muted-foreground">by {course.teacherId.fullName}</p>
            )}

            {course.isEnrolled ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{course.progressPercent}%</span>
                </div>
                <Progress value={course.progressPercent} />
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold">{course.price === 0 ? "Free" : `Rs. ${course.price}`}</span>
                <Button size="sm" className="brand-gradient-bg border-0 text-white" onClick={() => enroll(course._id)}>
                  Enroll
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
