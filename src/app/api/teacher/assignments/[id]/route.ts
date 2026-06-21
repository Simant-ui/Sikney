import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Assignment } from "@/models/Assignment";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const { id } = await params;
  const body = await request.json();

  await connectDB();
  const assignment = await Assignment.findOne({ _id: id, teacherId: session!.user.id });
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  if (typeof body.isPublished === "boolean") assignment.isPublished = body.isPublished;
  await assignment.save();

  return NextResponse.json(assignment);
}
