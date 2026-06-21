import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Submission } from "@/models/Submission";
import { Assignment } from "@/models/Assignment";
import { gradeSubmissionSchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const { id } = await params;
  const body = await request.json();
  const parsed = gradeSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const submission = await Submission.findById(id);
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const assignment = await Assignment.findOne({ _id: submission.assignmentId, teacherId: session!.user.id });
  if (!assignment) {
    return NextResponse.json({ error: "Not authorized for this assignment" }, { status: 403 });
  }

  submission.marksObtained = parsed.data.marksObtained;
  submission.feedback = parsed.data.feedback;
  submission.status = "graded";
  submission.gradedAt = new Date();
  await submission.save();

  return NextResponse.json(submission);
}
