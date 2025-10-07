import { JsonObject, prisma } from "@repo/db";

export function validateCredentials(
  credentials: any,
  platform: string
): string | null {
  if (
    !credentials ||
    !credentials.keys ||
    typeof credentials.keys !== "object" ||
    credentials.keys === null ||
    !(credentials.keys as JsonObject).apiKey
  ) {
    console.error(`No ${platform} credentials found for the user`);
    return null;
  }
  const apiKey = (credentials.keys as JsonObject).apiKey;
  return typeof apiKey === "string" ? apiKey : null;
}

export type TelegramMetadataValidationResult =
  | { valid: true; value: { chatId: string; message: string } }
  | { valid: false; missingFields: string[] };

export function validateTelegramMetadata(
  metadata: any
): TelegramMetadataValidationResult {
  const missingFields: string[] = [];
  if (typeof metadata?.chatId !== "string") missingFields.push("chatId");
  if (typeof metadata?.message !== "string") missingFields.push("message");

  if (missingFields.length > 0) {
    console.error(
      `Telegram Action metadata missing required fields: ${missingFields.join(", ")}`
    );
    return { valid: false, missingFields };
  }

  return {
    valid: true,
    value: {
      chatId: metadata.chatId,
      message: metadata.message,
    },
  };
}

export type EmailMetadataValidationResult =
  | {
      valid: true;
      value: { body: string; to: string; subject: string; from: string };
    }
  | { valid: false; missingFields: string[] };

export function validateEmailMetadata(
  metadata: any
): EmailMetadataValidationResult {
  const missingFields: string[] = [];
  if (typeof metadata?.body !== "string") missingFields.push("body");
  if (typeof metadata?.to !== "string") missingFields.push("to");
  if (typeof metadata?.subject !== "string") missingFields.push("subject");
  if (typeof metadata?.from !== "string") missingFields.push("from");

  if (missingFields.length > 0) {
    console.error(
      `Email Action metadata missing required fields: ${missingFields.join(", ")}`
    );
    return { valid: false, missingFields };
  }

  return {
    valid: true,
    value: {
      body: metadata.body,
      to: metadata.to,
      subject: metadata.subject,
      from: metadata.from,
    },
  };
}

export type GeminiMetadataValidationResult =
  | {
      valid: true;
      value: { message: string };
    }
  | { valid: false; missingFields: string[] };

export function validateGeminiMetadata(
  metadata: any
): GeminiMetadataValidationResult {
  const missingFields: string[] = [];
  if (typeof metadata?.message !== "string") missingFields.push("message");

  if (missingFields.length > 0) {
    console.error(
      `Gemini Action metadata missing required fields: ${missingFields.join(", ")}`
    );
    return { valid: false, missingFields };
  }

  return {
    valid: true,
    value: {
      message: metadata.message,
    },
  };
}

export async function updateErrorDB(workflowRunId: string, message: string) {
  await prisma.workflowRun.update({
    where: {
      id: workflowRunId,
    },
    data: {
      status: "Error",
      errorMetadata: {
        errorMessage: message,
      },
    },
  });
}
