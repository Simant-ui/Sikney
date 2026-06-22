import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT ?? 465),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

function otpEmailHtml(code: string, heading: string, message: string) {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f5f3ff;">
    <h1 style="font-size: 22px; color: #4338ca; margin-bottom: 8px;">Sikney</h1>
    <h2 style="font-size: 18px; color: #1f2937; margin-top: 24px;">${heading}</h2>
    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">${message}</p>
    <div style="margin: 24px 0; text-align: center;">
      <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4338ca; background: #ede9fe; padding: 16px 24px; border-radius: 12px;">${code}</span>
    </div>
    <p style="color: #9ca3af; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
  </div>`;
}

export async function sendOtpEmail(params: {
  to: string;
  code: string;
  purpose: "verify-email" | "reset-password";
}) {
  const { to, code, purpose } = params;
  const isVerify = purpose === "verify-email";

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: isVerify ? "Verify your Sikney account" : "Reset your Sikney password",
    html: otpEmailHtml(
      code,
      isVerify ? "Verify your email" : "Reset your password",
      isVerify
        ? "Use the verification code below to activate your Sikney account."
        : "Use the code below to reset your Sikney account password."
    ),
  });
}

function simpleEmailHtml(heading: string, message: string) {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f5f3ff;">
    <h1 style="font-size: 22px; color: #4338ca; margin-bottom: 8px;">Sikney</h1>
    <h2 style="font-size: 18px; color: #1f2937; margin-top: 24px;">${heading}</h2>
    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">${message}</p>
  </div>`;
}

export async function sendNewRecordingEmail(params: {
  to: string;
  teacherName: string;
  courseTitle: string;
  videoTitle: string;
}) {
  const { to, teacherName, courseTitle, videoTitle } = params;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `New recorded class: ${videoTitle}`,
    html: simpleEmailHtml(
      "New recorded class available",
      `${teacherName} just shared a new recording, "${videoTitle}", in your course "${courseTitle}". Log in to Sikney to watch it.`
    ),
  });
}
