import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Assignment } from "@/models/Assignment";
import { Enrollment } from "@/models/Enrollment";
import { Submission } from "@/models/Submission";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole("student");
  if (response) return response;

  const { id } = await params;
  const { fileUrl } = await request.json();
  if (!fileUrl) {
    return NextResponse.json({ error: "fileUrl is required" }, { status: 400 });
  }

  await connectDB();

  const assignment = await Assignment.findOne({ _id: id, isPublished: true });
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  const enrollment = await Enrollment.findOne({ studentId: session!.user.id, courseId: assignment.courseId });
  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
  }

  const submission = await Submission.findOneAndUpdate(
    { assignmentId: id, studentId: session!.user.id },
    { fileUrl, status: "pending", submittedAt: new Date(), $unset: { marksObtained: "", feedback: "", gradedAt: "" } },
    { upsert: true, new: true }
  );

  return NextResponse.json(submission, { status: 201 });
}
