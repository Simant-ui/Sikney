import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";
import { Quiz } from "@/models/Quiz";
import { Result } from "@/models/Result";

export async function GET() {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  await connectDB();

  const courses = await Course.find({ teacherId: session!.user.id }).lean();
  const courseMap = new Map(courses.map((c) => [String(c._id), c.title]));
  const courseIds = courses.map((c) => c._id);

  const quizzes = await Quiz.find({ courseId: { $in: courseIds } }).lean();
  const quizMap = new Map(quizzes.map((q) => [String(q._id), q.title]));

  const results = await Result.find({ courseId: { $in: courseIds } })
    .populate("studentId", "fullName email")
    .sort({ submittedAt: -1 })
    .lean();

  const data = results.map((r) => ({
    _id: r._id,
    student: r.studentId,
    quizTitle: quizMap.get(String(r.quizId)) ?? "Unknown quiz",
    courseTitle: courseMap.get(String(r.courseId)) ?? "Unknown course",
    score: r.score,
    totalMarks: r.totalMarks,
    percentage: r.percentage,
    submittedAt: r.submittedAt,
  }));

  return NextResponse.json(data);
}
