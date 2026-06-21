import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Enrollment } from "@/models/Enrollment";
import { LiveClass } from "@/models/LiveClass";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { Result } from "@/models/Result";
import { Attendance } from "@/models/Attendance";

export async function GET() {
  const { session, response } = await requireRole("student");
  if (response) return response;

  await connectDB();
  const studentId = session!.user.id;

  const enrollments = await Enrollment.find({ studentId, status: "active" }).lean();
  const courseIds = enrollments.map((e) => e.courseId);

  const [upcomingClasses, assignments, submissions, results, attendanceRecords] = await Promise.all([
    LiveClass.countDocuments({ courseId: { $in: courseIds }, scheduledAt: { $gte: new Date() } }),
    Assignment.find({ courseId: { $in: courseIds }, isPublished: true }).lean(),
    Submission.find({ studentId }).lean(),
    Result.find({ studentId }).lean(),
    Attendance.find({ studentId }).lean(),
  ]);

  const submittedAssignmentIds = new Set(submissions.map((s) => s.assignmentId.toString()));
  const pendingAssignments = assignments.filter((a) => !submittedAssignmentIds.has(String(a._id))).length;

  const avgQuizScore =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
      : 0;

  const attendancePercent =
    attendanceRecords.length > 0
      ? Math.round(
          (attendanceRecords.filter((a) => a.status === "present").length / attendanceRecords.length) * 100
        )
      : 0;

  return NextResponse.json({
    totalCourses: enrollments.length,
    upcomingClasses,
    pendingAssignments,
    avgQuizScore,
    attendancePercent,
  });
}
