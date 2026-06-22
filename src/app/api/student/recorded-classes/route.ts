import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Enrollment } from "@/models/Enrollment";
import { Course } from "@/models/Course";
import { Video } from "@/models/Video";

export async function GET() {
  const { session, response } = await requireRole("student");
  if (response) return response;

  await connectDB();

  const enrollments = await Enrollment.find({ studentId: session!.user.id, status: "active" }).lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } }).lean();
  const courseMap = new Map(courses.map((c) => [String(c._id), c.title]));

  const videos = await Video.find({ courseId: { $in: courseIds } }).sort({ createdAt: -1 }).lean();

  const result = videos.map((v) => ({
    ...v,
    courseTitle: courseMap.get(String(v.courseId)) ?? "Unknown course",
  }));

  return NextResponse.json(result);
}
