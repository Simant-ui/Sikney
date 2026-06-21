import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { OtpToken } from "@/models/OtpToken";
import { resetPasswordSchema } from "@/lib/validations";
import { hashOtpCode } from "@/lib/otp";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`reset-password:${getClientIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { email, code, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  await connectDB();

  const token = await OtpToken.findOne({
    email: normalizedEmail,
    purpose: "reset-password",
    consumedAt: { $exists: false },
  }).sort({ createdAt: -1 });

  if (!token || token.expiresAt < new Date()) {
    return NextResponse.json({ error: "Code expired or not found. Please request a new one." }, { status: 400 });
  }

  if (token.attempts >= 5) {
    return NextResponse.json({ error: "Too many incorrect attempts. Request a new code." }, { status: 429 });
  }

  if (token.codeHash !== hashOtpCode(code)) {
    token.attempts += 1;
    await token.save();
    return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
  }

  token.consumedAt = new Date();
  await token.save();

  const passwordHash = await bcrypt.hash(password, 12);
  await User.updateOne({ email: normalizedEmail }, { passwordHash });

  return NextResponse.json({ success: true });
}
