"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, BookOpen, ClipboardCheck, Banknote, CalendarCheck } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TeacherDashboardData {
  totalStudents: number;
  activeCourses: number;
  pendingSubmissions: number;
  totalEarnings: number;
  attendancePercent: number;
}

async function fetchDashboard(): Promise<TeacherDashboardData> {
  const res = await fetch("/api/teacher/dashboard");
  if (!res.ok) throw new Error("Failed to load dashboard");
  return res.json();
}

export default function TeacherDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["teacher-dashboard"], queryFn: fetchDashboard });

  const stats = [
    { label: "Total Students", value: data?.totalStudents ?? 0, icon: Users, accent: "violet" as const },
    { label: "Active Courses", value: data?.activeCourses ?? 0, icon: BookOpen, accent: "cyan" as const },
    { label: "Pending Grading", value: data?.pendingSubmissions ?? 0, icon: ClipboardCheck, accent: "amber" as const },
    { label: "Total Earnings", value: `Rs. ${data?.totalEarnings ?? 0}`, icon: Banknote, accent: "emerald" as const },
    { label: "Attendance Rate", value: `${data?.attendancePercent ?? 0}%`, icon: CalendarCheck, accent: "rose" as const },
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

      {!isLoading && data?.activeCourses === 0 && (
        <Card className="glass-strong border-0">
          <CardHeader>
            <CardTitle>Create your first course</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              You don&apos;t have any published courses yet. Create one to start teaching.
            </p>
            <Button asChild className="brand-gradient-bg border-0 text-white">
              <Link href="/teacher/courses/new">Create course</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
