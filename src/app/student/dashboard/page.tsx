"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, CalendarClock, ClipboardCheck, Award, CalendarCheck } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface StudentDashboardData {
  totalCourses: number;
  upcomingClasses: number;
  pendingAssignments: number;
  avgQuizScore: number;
  attendancePercent: number;
}

async function fetchDashboard(): Promise<StudentDashboardData> {
  const res = await fetch("/api/student/dashboard");
  if (!res.ok) throw new Error("Failed to load dashboard");
  return res.json();
}

export default function StudentDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["student-dashboard"], queryFn: fetchDashboard });

  const stats = [
    { label: "Total Courses", value: data?.totalCourses ?? 0, icon: BookOpen, accent: "violet" as const },
    { label: "Upcoming Classes", value: data?.upcomingClasses ?? 0, icon: CalendarClock, accent: "cyan" as const },
    { label: "Pending Assignments", value: data?.pendingAssignments ?? 0, icon: ClipboardCheck, accent: "amber" as const },
    { label: "Avg Quiz Score", value: `${data?.avgQuizScore ?? 0}%`, icon: Award, accent: "emerald" as const },
    { label: "Attendance", value: `${data?.attendancePercent ?? 0}%`, icon: CalendarCheck, accent: "rose" as const },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} isLoading={isLoading} />
        ))}
      </motion.div>

      {!isLoading && data?.totalCourses === 0 && (
        <Card className="glass-strong border-0">
          <CardHeader>
            <CardTitle>Get started</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              You haven&apos;t enrolled in any courses yet. Browse available courses to get started.
            </p>
            <Button asChild className="brand-gradient-bg border-0 text-white">
              <Link href="/student/courses">Browse courses</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
