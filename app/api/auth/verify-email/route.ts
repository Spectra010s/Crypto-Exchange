import { NextRequest, NextResponse } from "next/server";
import { findUserById, updateUser } from "@/lib/database";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as any;
    const userId = decoded.userId;

    // Update user email verification status
    await updateUser(userId, { emailVerified: true });

    return NextResponse.json({
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }
}
