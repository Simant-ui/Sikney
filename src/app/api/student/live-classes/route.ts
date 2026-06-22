import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Enrollment } from "@/models/Enrollment";
import { Course } from "@/models/Course";
import { LiveClass } from "@/models/LiveClass";

export async function GET() {
  const { session, response } = await requireRole("student");
  if (response) return response;

  await connectDB();

  const enrollments = await Enrollment.find({ studentId: session!.user.id, status: "active" }).lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } }).lean();
  const courseMap = new Map(courses.map((c) => [String(c._id), c.title]));

  const liveClasses = await LiveClass.find({
    courseId: { $in: courseIds },
    $or: [{ studentIds: { $size: 0 } }, { studentIds: session!.user.id }],
  })
    .sort({ scheduledAt: 1 })
    .lean();

  const result = liveClasses.map((l) => ({
    ...l,
    courseTitle: courseMap.get(String(l.courseId)) ?? "Unknown course",
  }));

  return NextResponse.json(result);
}
