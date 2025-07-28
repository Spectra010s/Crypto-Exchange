import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { authenticateWallet } from "@/lib/wallet-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, signature, message, chainId } = body;

    if (!address || !signature || !message || !chainId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await authenticateWallet({
      address,
      signature,
      message,
      chainId,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.user.id },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    // Remove sensitive data
    const { password_hash: _, ...userWithoutPassword } = result.user;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
      isNewUser: result.isNewUser,
      message: result.isNewUser
        ? "Wallet account created successfully"
        : "Wallet authentication successful",
    });
  } catch (error: any) {
    console.error("Wallet authentication error:", error);
    return NextResponse.json(
      { error: error.message || "Wallet authentication failed" },
      { status: 400 }
    );
  }
}
