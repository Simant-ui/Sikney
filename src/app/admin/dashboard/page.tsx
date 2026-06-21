"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, GraduationCap, UserCheck, BookOpen, Banknote } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";

interface AdminDashboardData {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  activeCourses: number;
  totalRevenue: number;
}

async function fetchDashboard(): Promise<AdminDashboardData> {
  const res = await fetch("/api/admin/dashboard");
  if (!res.ok) throw new Error("Failed to load dashboard");
  return res.json();
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-dashboard"], queryFn: fetchDashboard });

  const stats = [
    { label: "Total Users", value: data?.totalUsers ?? 0, icon: Users, accent: "violet" as const },
    { label: "Total Students", value: data?.totalStudents ?? 0, icon: GraduationCap, accent: "cyan" as const },
    { label: "Total Teachers", value: data?.totalTeachers ?? 0, icon: UserCheck, accent: "amber" as const },
    { label: "Active Courses", value: data?.activeCourses ?? 0, icon: BookOpen, accent: "rose" as const },
    { label: "Total Revenue", value: `Rs. ${data?.totalRevenue ?? 0}`, icon: Banknote, accent: "emerald" as const },
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
    </div>
  );
}
