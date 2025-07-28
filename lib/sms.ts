import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendVerificationSMS(phone: string, code: string) {
  try {
    const message = await client.messages.create({
      body: `Your Biaz verification code is: ${code}. This code will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return message;
  } catch (error) {
    console.error("SMS sending error:", error);
    throw new Error("Failed to send SMS");
  }
}

export async function sendWelcomeSMS(phone: string) {
  try {
    const message = await client.messages.create({
      body: "Welcome to Biaz! Your account has been created successfully. You can now connect your wallet and start trading.",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return message;
  } catch (error) {
    console.error("SMS sending error:", error);
    throw new Error("Failed to send SMS");
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
