import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { findUserById, updateUser } from "./database";

const rpName = "Biaz";
const rpID =
  process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, "") || "localhost";
const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function generateRegistrationOptions(
  userId: number,
  username: string
) {
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: userId.toString(),
    userName: username,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  return options;
}

export async function generateAuthenticationOptions(userId: number) {
  const user = await findUserById(userId);
  if (!user || !user.passkey_enabled) {
    throw new Error("User not found or passkey not enabled");
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials:
      user.credentials?.map((cred) => ({
        id: isoBase64URL.toBuffer(cred.id),
        type: "public-key",
      })) || [],
    userVerification: "preferred",
  });

  return options;
}

export async function verifyRegistration(userId: number, response: any) {
  const verification = await verifyRegistrationResponse({
    response,
    expectedRPID: rpID,
    expectedOrigin: origin,
  });

  if (verification.verified) {
    const { credentialID, credentialPublicKey } =
      verification.registrationInfo!;

    // Save credential to database
    await updateUser(userId, {
      passkeyEnabled: true,
      credentials: [
        {
          id: isoBase64URL.fromBuffer(credentialID),
          publicKey: isoBase64URL.fromBuffer(credentialPublicKey),
        },
      ],
    });

    return true;
  }

  return false;
}

export async function verifyAuthentication(userId: number, response: any) {
  const user = await findUserById(userId);
  if (!user || !user.credentials) {
    throw new Error("User not found or no credentials");
  }

  const verification = await verifyAuthenticationResponse({
    response,
    expectedRPID: rpID,
    expectedOrigin: origin,
    authenticator: user.credentials[0],
  });

  return verification.verified;
}

// Biometric authentication helpers
export async function setupBiometrics(userId: number) {
  try {
    // Check if device supports biometrics
    if (!window.PublicKeyCredential) {
      throw new Error("Biometric authentication not supported");
    }

    const user = await findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate registration options
    const options = await generateRegistrationOptions(
      userId,
      user.username || user.email || "user"
    );

    // Create credential
    const credential = (await navigator.credentials.create({
      publicKey: options,
    })) as PublicKeyCredential;

    // Verify and save
    const verified = await verifyRegistration(userId, credential);

    if (verified) {
      await updateUser(userId, { biometricEnabled: true });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Biometric setup error:", error);
    throw error;
  }
}

export async function authenticateWithBiometrics(userId: number) {
  try {
    const user = await findUserById(userId);
    if (!user || !user.biometric_enabled) {
      throw new Error("Biometric authentication not enabled");
    }

    // Generate authentication options
    const options = await generateAuthenticationOptions(userId);

    // Get credential
    const credential = (await navigator.credentials.get({
      publicKey: options,
    })) as PublicKeyCredential;

    // Verify
    const verified = await verifyAuthentication(userId, credential);

    return verified;
  } catch (error) {
    console.error("Biometric authentication error:", error);
    throw error;
  }
}
