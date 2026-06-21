import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { StudentProfile } from "@/models/StudentProfile";
import { TeacherProfile } from "@/models/TeacherProfile";
import { updateProfileSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let bio = "";
  if (user.role === "student") {
    const profile = await StudentProfile.findOne({ userId: user._id }).lean();
    bio = (profile as { bio?: string } | null)?.bio ?? "";
  } else if (user.role === "teacher") {
    const profile = await TeacherProfile.findOne({ userId: user._id }).lean();
    bio = (profile as { bio?: string } | null)?.bio ?? "";
  }

  return NextResponse.json({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl,
    notificationPrefs: user.notificationPrefs,
    bio,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const { fullName, phone, bio } = parsed.data;

  await User.updateOne({ _id: session.user.id }, { fullName, phone });

  if (session.user.role === "student") {
    await StudentProfile.updateOne({ userId: session.user.id }, { bio }, { upsert: true });
  } else if (session.user.role === "teacher") {
    await TeacherProfile.updateOne({ userId: session.user.id }, { bio }, { upsert: true });
  }

  return NextResponse.json({ success: true });
}
