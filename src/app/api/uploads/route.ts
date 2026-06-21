import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "File uploads aren't configured yet. Add Cloudinary credentials to enable this." },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = formData.get("folder");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await getCloudinary().uploader.upload(base64, {
    folder: `sikney/${typeof folder === "string" && folder ? folder : "uploads"}`,
    resource_type: "auto",
  });

  return NextResponse.json({ url: result.secure_url, fileName: file.name, fileType: file.type });
}
