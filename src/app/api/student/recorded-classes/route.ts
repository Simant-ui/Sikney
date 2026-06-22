import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Enrollment } from "@/models/Enrollment";
import { Course } from "@/models/Course";
import { Video } from "@/models/Video";
import { User } from "@/models/User";

export async function GET() {
  const { session, response } = await requireRole("student");
  if (response) return response;

  await connectDB();

  const enrollments = await Enrollment.find({ studentId: session!.user.id, status: "active" }).lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } }).lean();
  const courseMap = new Map(courses.map((c) => [String(c._id), c]));

  const teachers = await User.find({ _id: { $in: courses.map((c) => c.teacherId) } })
    .select("fullName")
    .lean();
  const teacherMap = new Map(teachers.map((t) => [String(t._id), t.fullName]));

  const videos = await Video.find({
    courseId: { $in: courseIds },
    $or: [{ studentIds: { $size: 0 } }, { studentIds: session!.user.id }],
  })
    .sort({ createdAt: -1 })
    .lean();

  const result = videos.map((v) => {
    const course = courseMap.get(String(v.courseId));
    return {
      ...v,
      courseTitle: course?.title ?? "Unknown course",
      teacherName: course ? teacherMap.get(String(course.teacherId)) ?? "Unknown teacher" : "Unknown teacher",
    };
  });

  return NextResponse.json(result);
}
