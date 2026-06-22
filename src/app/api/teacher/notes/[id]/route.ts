import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";
import { Note } from "@/models/Note";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const { id } = await params;

  await connectDB();

  const note = await Note.findById(id);
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const course = await Course.findOne({ _id: note.courseId, teacherId: session!.user.id });
  if (!course) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  await note.deleteOne();

  return NextResponse.json({ success: true });
}
