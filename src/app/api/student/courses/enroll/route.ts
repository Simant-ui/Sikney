import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import { StudentProfile } from "@/models/StudentProfile";

export async function POST(request: Request) {
  const { session, response } = await requireRole("student");
  if (response) return response;

  const { courseId } = await request.json();
  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  await connectDB();

  const course = await Course.findOne({ _id: courseId, isPublished: true });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const existing = await Enrollment.findOne({ studentId: session!.user.id, courseId });
  if (existing) {
    return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
  }

  await Enrollment.create({ studentId: session!.user.id, courseId });
  await Course.updateOne({ _id: courseId }, { $inc: { studentsEnrolledCount: 1 } });
  await StudentProfile.updateOne({ userId: session!.user.id }, { $addToSet: { enrolledCourses: courseId } });

  return NextResponse.json({ success: true }, { status: 201 });
}
