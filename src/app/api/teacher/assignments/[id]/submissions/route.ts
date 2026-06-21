import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const { id } = await params;
  await connectDB();

  const assignment = await Assignment.findOne({ _id: id, teacherId: session!.user.id });
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  const submissions = await Submission.find({ assignmentId: id })
    .populate("studentId", "fullName email")
    .sort({ submittedAt: -1 })
    .lean();

  return NextResponse.json({ assignment, submissions });
}
