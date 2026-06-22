import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";

export async function GET() {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  await connectDB();

  const courses = await Course.find({ teacherId: session!.user.id }).lean();
  const courseMap = new Map(courses.map((c) => [String(c._id), c.title]));
  const courseIds = courses.map((c) => c._id);

  const enrollments = await Enrollment.find({ courseId: { $in: courseIds }, status: "active" })
    .populate("studentId", "fullName email avatarUrl")
    .lean();

  const studentsMap = new Map<
    string,
    { _id: string; fullName: string; email: string; avatarUrl?: string; courses: string[] }
  >();

  for (const e of enrollments) {
    const student = e.studentId as unknown as { _id: string; fullName: string; email: string; avatarUrl?: string };
    const key = String(student._id);
    const existing = studentsMap.get(key);
    const courseTitle = courseMap.get(String(e.courseId)) ?? "Unknown course";
    if (existing) {
      existing.courses.push(courseTitle);
    } else {
      studentsMap.set(key, {
        _id: key,
        fullName: student.fullName,
        email: student.email,
        avatarUrl: student.avatarUrl,
        courses: [courseTitle],
      });
    }
  }

  return NextResponse.json(Array.from(studentsMap.values()));
}
