import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Enrollment } from "@/models/Enrollment";
import { Course } from "@/models/Course";
import { Quiz } from "@/models/Quiz";
import { Result } from "@/models/Result";

export async function GET() {
  const { session, response } = await requireRole("student");
  if (response) return response;

  await connectDB();

  const enrollments = await Enrollment.find({ studentId: session!.user.id, status: "active" }).lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } }).lean();
  const courseMap = new Map(courses.map((c) => [String(c._id), c.title]));

  const [quizzes, results] = await Promise.all([
    Quiz.find({ courseId: { $in: courseIds }, isPublished: true }).sort({ createdAt: -1 }).lean(),
    Result.find({ studentId: session!.user.id }).lean(),
  ]);

  const resultMap = new Map(results.map((r) => [String(r.quizId), r]));

  const result = quizzes.map((q) => {
    const attempt = resultMap.get(String(q._id));
    return {
      _id: q._id,
      title: q.title,
      courseTitle: courseMap.get(String(q.courseId)) ?? "Unknown course",
      durationMinutes: q.durationMinutes,
      totalMarks: q.totalMarks,
      questionCount: q.questions.length,
      attempted: Boolean(attempt),
      score: attempt?.score,
      percentage: attempt?.percentage,
    };
  });

  return NextResponse.json(result);
}
