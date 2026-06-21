import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import { Attendance } from "@/models/Attendance";

function startOfDay(dateStr: string) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(request: Request) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  const date = searchParams.get("date") ?? new Date().toISOString();
  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  await connectDB();

  const course = await Course.findOne({ _id: courseId, teacherId: session!.user.id });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const enrollments = await Enrollment.find({ courseId, status: "active" })
    .populate("studentId", "fullName email")
    .lean();

  const day = startOfDay(date);
  const records = await Attendance.find({ courseId, date: day }).lean();
  const statusMap = new Map(records.map((r) => [String(r.studentId), r.status]));

  const students = enrollments.map((e) => {
    const student = e.studentId as unknown as { _id: string; fullName: string; email: string };
    return {
      studentId: String(student._id),
      fullName: student.fullName,
      email: student.email,
      status: statusMap.get(String(student._id)) ?? null,
    };
  });

  return NextResponse.json({ students, date: day.toISOString() });
}

export async function POST(request: Request) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const body = await request.json();
  const { courseId, date, records } = body as {
    courseId: string;
    date: string;
    records: { studentId: string; status: "present" | "absent" | "late" }[];
  };

  if (!courseId || !date || !Array.isArray(records)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const course = await Course.findOne({ _id: courseId, teacherId: session!.user.id });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const day = startOfDay(date);

  await Promise.all(
    records.map((r) =>
      Attendance.findOneAndUpdate(
        { courseId, studentId: r.studentId, date: day },
        { status: r.status, markedBy: session!.user.id },
        { upsert: true }
      )
    )
  );

  return NextResponse.json({ success: true });
}
