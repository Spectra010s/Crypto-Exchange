import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Mock database - replace with real database
const users: any[] = [];

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
    const existingUser = users.find(
      (user) =>
        (email && user.email === email) ||
        (phone && user.phone === phone) ||
        (username && user.username === username)
    );

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
    const user = {
      id: Date.now().toString(),
      email,
      phone,
      username,
      displayName: displayName || email?.split("@")[0] || `User${Date.now()}`,
      passwordHash,
      emailVerified: false,
      phoneVerified: false,
      passkeyEnabled: false,
      biometricEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(user);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    // Remove sensitive data
    const { passwordHash: _, ...userWithoutPassword } = user;

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
 