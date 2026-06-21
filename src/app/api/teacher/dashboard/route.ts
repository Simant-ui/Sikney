import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { Attendance } from "@/models/Attendance";
import { TeacherProfile } from "@/models/TeacherProfile";

export async function GET() {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  await connectDB();
  const teacherId = session!.user.id;

  const courses = await Course.find({ teacherId }).lean();
  const courseIds = courses.map((c) => c._id);

  const [totalStudents, activeCourses, pendingSubmissions, attendanceRecords, profile] = await Promise.all([
    Enrollment.countDocuments({ courseId: { $in: courseIds }, status: "active" }),
    Course.countDocuments({ teacherId, isPublished: true }),
    (async () => {
      const assignments = await Assignment.find({ courseId: { $in: courseIds } }).lean();
      const assignmentIds = assignments.map((a) => a._id);
      return Submission.countDocuments({ assignmentId: { $in: assignmentIds }, status: "pending" });
    })(),
    Attendance.find({ courseId: { $in: courseIds } }).lean(),
    TeacherProfile.findOne({ userId: teacherId }).lean(),
  ]);

  const attendancePercent =
    attendanceRecords.length > 0
      ? Math.round(
          (attendanceRecords.filter((a) => a.status === "present").length / attendanceRecords.length) * 100
        )
      : 0;

  return NextResponse.json({
    totalStudents,
    activeCourses,
    pendingSubmissions,
    totalEarnings: (profile as { totalEarnings?: number } | null)?.totalEarnings ?? 0,
    attendancePercent,
  });
}
