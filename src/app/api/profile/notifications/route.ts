import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { email, push, sms } = body ?? {};

  await connectDB();
  await User.updateOne(
    { _id: session.user.id },
    {
      $set: {
        ...(typeof email === "boolean" && { "notificationPrefs.email": email }),
        ...(typeof push === "boolean" && { "notificationPrefs.push": push }),
        ...(typeof sms === "boolean" && { "notificationPrefs.sms": sms }),
      },
    }
  );

  return NextResponse.json({ success: true });
}
