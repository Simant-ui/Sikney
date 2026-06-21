import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { OtpToken } from "@/models/OtpToken";
import { verifyOtpSchema } from "@/lib/validations";
import { hashOtpCode } from "@/lib/otp";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`verify-otp:${getClientIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, code } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  await connectDB();

  const token = await OtpToken.findOne({
    email: normalizedEmail,
    purpose: "verify-email",
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

  await User.updateOne({ email: normalizedEmail }, { isEmailVerified: true });

  return NextResponse.json({ success: true });
}
