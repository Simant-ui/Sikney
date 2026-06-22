"use client";

import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";

interface StudentOption {
  _id: string;
  fullName: string;
  email: string;
}

async function fetchStudents(courseId: string): Promise<StudentOption[]> {
  const res = await fetch(`/api/teacher/courses/${courseId}/students`);
  if (!res.ok) throw new Error("Failed to load students");
  return res.json();
}

interface StudentPickerProps {
  courseId: string;
  value: string[];
  onChange: (studentIds: string[]) => void;
}

export function StudentPicker({ courseId, value, onChange }: StudentPickerProps) {
  const { data: students, isLoading } = useQuery({
    queryKey: ["course-students", courseId],
    queryFn: () => fetchStudents(courseId),
    enabled: Boolean(courseId),
  });

  if (!courseId) return null;
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading students...</p>;
  if (!students?.length) return <p className="text-sm text-muted-foreground">No students enrolled in this course yet.</p>;

  function toggle(studentId: string) {
    onChange(value.includes(studentId) ? value.filter((id) => id !== studentId) : [...value, studentId]);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Leave all unchecked to send to every enrolled student.</p>
      <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-border/60 p-3">
        {students.map((s) => (
          <label key={s._id} className="flex items-center gap-2 text-sm">
            <Checkbox checked={value.includes(s._id)} onCheckedChange={() => toggle(s._id)} />
            <span>{s.fullName}</span>
            <span className="text-xs text-muted-foreground">{s.email}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
