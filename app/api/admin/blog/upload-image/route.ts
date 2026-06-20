import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { cookies } from "next/headers";

// POST /api/admin/blog/upload-image
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get("admin_auth");

    if (!adminAuth || adminAuth.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.type.split("/")[1] || "png";
    const blob = await put(`blog/img-${Date.now()}.${ext}`, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
