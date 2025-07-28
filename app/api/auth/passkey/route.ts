import { NextRequest, NextResponse } from "next/server";
import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistration,
  verifyAuthentication,
} from "@/lib/passkey";
import { findUserById } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, username, response } = body;

    if (action === "generate-registration") {
      const options = await generateRegistrationOptions(userId, username);
      return NextResponse.json({ options });
    }

    if (action === "generate-authentication") {
      const options = await generateAuthenticationOptions(userId);
      return NextResponse.json({ options });
    }

    if (action === "verify-registration") {
      const verified = await verifyRegistration(userId, response);
      return NextResponse.json({ verified });
    }

    if (action === "verify-authentication") {
      const verified = await verifyAuthentication(userId, response);
      return NextResponse.json({ verified });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Passkey error:", error);
    return NextResponse.json(
      { error: error.message || "Passkey operation failed" },
      { status: 500 }
    );
  }
}
