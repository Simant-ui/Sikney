"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CalendarCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CourseOption {
  _id: string;
  title: string;
}

type AttendanceStatus = "present" | "absent" | "late";

interface StudentAttendance {
  studentId: string;
  fullName: string;
  email: string;
  status: AttendanceStatus | null;
}

async function fetchCourses(): Promise<CourseOption[]> {
  const res = await fetch("/api/teacher/courses");
  if (!res.ok) throw new Error("Failed to load courses");
  return res.json();
}

async function fetchAttendance(courseId: string, date: string): Promise<{ students: StudentAttendance[] }> {
  const res = await fetch(`/api/teacher/attendance?courseId=${courseId}&date=${date}`);
  if (!res.ok) throw new Error("Failed to load attendance");
  return res.json();
}

const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
];

export default function TeacherAttendancePage() {
  const queryClient = useQueryClient();
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: courses } = useQuery({ queryKey: ["teacher-courses"], queryFn: fetchCourses });
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-attendance", courseId, date],
    queryFn: () => fetchAttendance(courseId, date),
    enabled: Boolean(courseId && date),
  });

  useEffect(() => {
    if (!data) return;
    const initial: Record<string, AttendanceStatus> = {};
    for (const s of data.students) {
      initial[s.studentId] = s.status ?? "present";
    }
    setMarks(initial);
  }, [data]);

  async function handleSave() {
    if (!data?.students.length) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          date,
          records: data.students.map((s) => ({ studentId: s.studentId, status: marks[s.studentId] ?? "present" })),
        }),
      });
      if (!res.ok) {
        toast.error("Could not save attendance");
        return;
      }
      toast.success("Attendance saved");
      queryClient.invalidateQueries({ queryKey: ["teacher-attendance", courseId, date] });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Mark attendance for your courses.</p>

      <Card className="glass-strong border-0">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="space-y-2">
            <Label>Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((c) => (
                  <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
          </div>
        </CardContent>
      </Card>

      {!courseId && (
        <Card className="glass-strong border-0">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarCheck className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">Select a course to mark attendance.</p>
          </CardContent>
        </Card>
      )}

      {courseId && isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      )}

      {courseId && !isLoading && data?.students.length === 0 && (
        <Card className="glass-strong border-0">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No active students enrolled in this course.
          </CardContent>
        </Card>
      )}

      {courseId && !isLoading && Boolean(data?.students.length) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {data!.students.map((s) => (
            <Card key={s.studentId} className="glass border-0">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{s.fullName}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
                <div className="flex gap-1.5">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMarks((m) => ({ ...m, [s.studentId]: opt.value }))}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                        marks[s.studentId] === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={handleSave} disabled={isSaving} className="brand-gradient-bg border-0 text-white">
            Save attendance
          </Button>
        </motion.div>
      )}
    </div>
  );
}
