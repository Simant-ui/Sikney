import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { StudentProfile } from "@/models/StudentProfile";
import { TeacherProfile } from "@/models/TeacherProfile";
import { OtpToken } from "@/models/OtpToken";
import { signupSchema } from "@/lib/validations";
import { generateOtpCode, hashOtpCode, otpExpiry } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

async function generateUniqueUsername(email: string): Promise<string> {
  const base = email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase() || "user";
  let candidate = base;
  let suffix = 0;

  while (await User.findOne({ username: candidate })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }

  return candidate;
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { fullName, email, phone, password, role } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  await connectDB();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const username = await generateUniqueUsername(normalizedEmail);

  const user = await User.create({
    fullName,
    username,
    email: normalizedEmail,
    phone,
    passwordHash,
    role,
  });

  if (role === "student") {
    await StudentProfile.create({ userId: user._id, enrolledCourses: [] });
  } else {
    await TeacherProfile.create({ userId: user._id, subjects: [] });
  }

  const code = generateOtpCode();
  await OtpToken.create({
    userId: user._id,
    email: normalizedEmail,
    codeHash: hashOtpCode(code),
    purpose: "verify-email",
    expiresAt: otpExpiry(10),
  });

  await sendOtpEmail({ to: normalizedEmail, code, purpose: "verify-email" });

  return NextResponse.json({ email: normalizedEmail }, { status: 201 });
}
