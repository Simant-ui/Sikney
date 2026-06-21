import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { OtpToken } from "@/models/OtpToken";
import { resendOtpSchema } from "@/lib/validations";
import { generateOtpCode, hashOtpCode, otpExpiry } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`resend-otp:${getClientIp(request)}`, 5, 5 * 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = resendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, purpose } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  await connectDB();
  const user = await User.findOne({ email: normalizedEmail });

  // Always respond success to avoid leaking whether an email is registered.
  if (!user) {
    return NextResponse.json({ success: true });
  }

  const code = generateOtpCode();
  await OtpToken.create({
    userId: user._id,
    email: normalizedEmail,
    codeHash: hashOtpCode(code),
    purpose,
    expiresAt: otpExpiry(10),
  });

  await sendOtpEmail({ to: normalizedEmail, code, purpose });

  return NextResponse.json({ success: true });
}
