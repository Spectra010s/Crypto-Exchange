import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { findUserById } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as any;

    // Find user
    const user = await findUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove sensitive data
    const { password_hash: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
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
    });
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
