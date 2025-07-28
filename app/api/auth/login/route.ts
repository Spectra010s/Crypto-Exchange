import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  findUserByPhone,
  findUserByUsername,
} from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, credential } = body;

    if (!method || !credential) {
      return NextResponse.json(
        { error: "Method and credential are required" },
        { status: 400 }
      );
    }

    // Find user based on login method
    let user = null;
    if (method.type === "email") {
      user = await findUserByEmail(method.identifier);
    } else if (method.type === "phone") {
      user = await findUserByPhone(method.identifier);
    } else if (method.type === "username") {
      user = await findUserByUsername(method.identifier);
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      credential,
      user.password_hash
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

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
      loginMethods: [
        {
          type: "email",
          identifier: user.email,
          verified: user.email_verified,
        },
        {
          type: "phone",
          identifier: user.phone,
          verified: user.phone_verified,
        },
        { type: "username", identifier: user.username, verified: true },
      ].filter((method) => method.identifier),
      walletInfo: user.wallet_address
        ? {
            address: user.wallet_address,
            type: user.wallet_type || "ethereum",
            chain: "mainnet",
            isImported: false,
            hasBackup: false,
          }
        : null,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
