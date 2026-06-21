import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Enrollment } from "@/models/Enrollment";
import { Course } from "@/models/Course";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";

export async function GET() {
  const { session, response } = await requireRole("student");
  if (response) return response;

  await connectDB();

  const enrollments = await Enrollment.find({ studentId: session!.user.id, status: "active" }).lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } }).lean();
  const courseMap = new Map(courses.map((c) => [String(c._id), c.title]));

  const [assignments, submissions] = await Promise.all([
    Assignment.find({ courseId: { $in: courseIds }, isPublished: true }).sort({ dueDate: 1 }).lean(),
    Submission.find({ studentId: session!.user.id }).lean(),
  ]);

  const submissionMap = new Map(submissions.map((s) => [String(s.assignmentId), s]));

  const result = assignments.map((a) => {
    const submission = submissionMap.get(String(a._id));
    return {
      ...a,
      courseTitle: courseMap.get(String(a.courseId)) ?? "Unknown course",
      submission: submission
        ? {
            status: submission.status,
            marksObtained: submission.marksObtained,
            feedback: submission.feedback,
            fileUrl: submission.fileUrl,
          }
        : null,
    };
  });

  return NextResponse.json(result);
}
