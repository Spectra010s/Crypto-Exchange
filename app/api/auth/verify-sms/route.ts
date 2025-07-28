import { NextRequest, NextResponse } from "next/server";
import { findUserById, updateUser, verifyCode } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, code } = body;

    if (!userId || !code) {
      return NextResponse.json(
        { error: "User ID and code are required" },
        { status: 400 }
      );
    }

    // Verify the code
    const isValid = await verifyCode(userId, code, "phone");

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    // Update user phone verification status
    await updateUser(userId, { phoneVerified: true });

    return NextResponse.json({
      message: "Phone number verified successfully",
    });
  } catch (error: any) {
    console.error("SMS verification error:", error);
    return NextResponse.json(
      { error: error.message || "SMS verification failed" },
      { status: 500 }
    );
  }
}
