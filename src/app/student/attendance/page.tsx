"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceRecord {
  _id: string;
  courseTitle: string;
  date: string;
  status: "present" | "absent" | "late";
}

interface CourseSummary {
  courseId: string;
  courseTitle: string;
  total: number;
  presentCount: number;
}

async function fetchAttendance(): Promise<{ records: AttendanceRecord[]; summary: CourseSummary[] }> {
  const res = await fetch("/api/student/attendance");
  if (!res.ok) throw new Error("Failed to load attendance");
  return res.json();
}

const statusVariant: Record<AttendanceRecord["status"], "default" | "secondary" | "destructive"> = {
  present: "default",
  late: "secondary",
  absent: "destructive",
};

export default function StudentAttendancePage() {
  const { data, isLoading } = useQuery({ queryKey: ["student-attendance"], queryFn: fetchAttendance });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.records.length) {
    return (
      <Card className="glass-strong border-0">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarCheck className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">No attendance records yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {data.summary.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.summary.map((s) => (
            <Card key={s.courseId} className="glass border-0">
              <CardContent className="p-4">
                <p className="font-medium">{s.courseTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {s.presentCount} / {s.total} classes present
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        {data.records.map((r) => (
          <Card key={r._id} className="glass border-0">
            <CardContent className="flex items-center justify-between p-3.5">
              <div>
                <p className="text-sm font-medium">{r.courseTitle}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(r.date), "MMM d, yyyy")}</p>
              </div>
              <Badge variant={statusVariant[r.status]} className="capitalize">{r.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
