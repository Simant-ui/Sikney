import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { OtpToken } from "@/models/OtpToken";
import { forgotPasswordSchema } from "@/lib/validations";
import { generateOtpCode, hashOtpCode, otpExpiry } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`forgot-password:${getClientIp(request)}`, 5, 5 * 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const normalizedEmail = parsed.data.email.toLowerCase();

  await connectDB();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return NextResponse.json({ success: true });
  }

  const code = generateOtpCode();
  await OtpToken.create({
    userId: user._id,
    email: normalizedEmail,
    codeHash: hashOtpCode(code),
    purpose: "reset-password",
    expiresAt: otpExpiry(10),
  });

  await sendOtpEmail({ to: normalizedEmail, code, purpose: "reset-password" });

  return NextResponse.json({ success: true });
}
