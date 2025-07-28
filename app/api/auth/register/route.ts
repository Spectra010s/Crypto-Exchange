import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  findUserByPhone,
  findUserByUsername,
} from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, username, password, displayName } = body;

    // Validate input
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser =
      (email && (await findUserByEmail(email))) ||
      (phone && (await findUserByPhone(phone))) ||
      (username && (await findUserByUsername(username)));

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email, phone, or username" },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await createUser({
      email,
      phone,
      username,
      displayName: displayName || email?.split("@")[0] || `User${Date.now()}`,
      passwordHash,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    // Remove sensitive data
    const { password_hash: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
