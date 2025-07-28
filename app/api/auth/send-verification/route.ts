import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";
import { sendVerificationSMS, generateVerificationCode } from "@/lib/sms";
import {
  findUserByEmail,
  findUserByPhone,
  createVerificationCode,
} from "@/lib/database";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, identifier } = body;

    if (!type || !identifier) {
      return NextResponse.json(
        { error: "Type and identifier are required" },
        { status: 400 }
      );
    }

    if (type === "email") {
      const user = await findUserByEmail(identifier);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Generate verification token
      const token = jwt.sign(
        { userId: user.id, type: "email" },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "24h" }
      );

      // Send verification email
      await sendVerificationEmail(identifier, token);

      return NextResponse.json({
        message: "Verification email sent successfully",
      });
    } else if (type === "phone") {
      const user = await findUserByPhone(identifier);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Generate verification code
      const code = generateVerificationCode();
      await createVerificationCode(user.id, code, "phone");

      // Send verification SMS
      await sendVerificationSMS(identifier, code);

      return NextResponse.json({
        message: "Verification SMS sent successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid verification type" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send verification" },
      { status: 500 }
    );
  }
}
