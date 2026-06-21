import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const { id } = await params;
  const body = await request.json();

  await connectDB();

  const course = await Course.findOne({ _id: id, teacherId: session!.user.id });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (typeof body.isPublished === "boolean") {
    course.isPublished = body.isPublished;
  }
  if (typeof body.title === "string") course.title = body.title;
  if (typeof body.description === "string") course.description = body.description;
  if (typeof body.price === "number") course.price = body.price;

  await course.save();
  return NextResponse.json(course);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const { id } = await params;
  await connectDB();

  const result = await Course.deleteOne({ _id: id, teacherId: session!.user.id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
