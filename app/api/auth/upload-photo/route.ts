import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { findUserById, updateUser } from "@/lib/database";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as any;
    const userId = decoded.userId;

    const formData = await request.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      return NextResponse.json({ error: "No photo provided" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const imageUrl = await uploadImage(buffer, "profile-photos");

    // Update user profile
    await updateUser(userId, { photoUrl: imageUrl });

    return NextResponse.json({
      photoUrl: imageUrl,
      message: "Photo uploaded successfully",
    });
  } catch (error: any) {
    console.error("Photo upload error:", error);
    return NextResponse.json(
      { error: error.message || "Photo upload failed" },
      { status: 500 }
    );
  }
}
