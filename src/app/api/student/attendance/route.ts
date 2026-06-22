import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Enrollment } from "@/models/Enrollment";
import { Course } from "@/models/Course";
import { Attendance } from "@/models/Attendance";

export async function GET() {
  const { session, response } = await requireRole("student");
  if (response) return response;

  await connectDB();

  const enrollments = await Enrollment.find({ studentId: session!.user.id, status: "active" }).lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } }).lean();
  const courseMap = new Map(courses.map((c) => [String(c._id), c.title]));

  const records = await Attendance.find({ studentId: session!.user.id })
    .sort({ date: -1 })
    .lean();

  const result = records.map((r) => ({
    _id: String(r._id),
    courseId: String(r.courseId),
    courseTitle: courseMap.get(String(r.courseId)) ?? "Unknown course",
    date: r.date,
    status: r.status,
  }));

  const summary = courses.map((c) => {
    const courseRecords = records.filter((r) => String(r.courseId) === String(c._id));
    const presentCount = courseRecords.filter((r) => r.status === "present").length;
    return {
      courseId: String(c._id),
      courseTitle: c.title,
      total: courseRecords.length,
      presentCount,
    };
  });

  return NextResponse.json({ records: result, summary });
}
