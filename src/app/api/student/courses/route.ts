import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";

export async function GET() {
  const { session, response } = await requireRole("student");
  if (response) return response;

  await connectDB();

  const [enrollments, publishedCourses] = await Promise.all([
    Enrollment.find({ studentId: session!.user.id }).lean(),
    Course.find({ isPublished: true }).populate("teacherId", "fullName").sort({ createdAt: -1 }).lean(),
  ]);

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId.toString()));
  const progressByCourse = new Map(enrollments.map((e) => [e.courseId.toString(), e.progressPercent]));

  const courses = publishedCourses.map((course) => ({
    ...course,
    isEnrolled: enrolledCourseIds.has(String(course._id)),
    progressPercent: progressByCourse.get(String(course._id)) ?? 0,
  }));

  return NextResponse.json(courses);
}
