import { JsonObject } from "@repo/db";

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

export function validateTelegramMetadata(
  metadata: any
): { chatId: string; message: string } | null {
  const messageTemplate = metadata?.message;
  const chatId = metadata?.chatId;

  if (typeof messageTemplate !== "string" || typeof chatId !== "string") {
    console.error("Action metadata missing required fields", metadata);
    return null;
  }

  return { chatId, message: messageTemplate };
}

export function validateEmailMetadata(
  metadata: any
): { body: string; to: string; subject: string; from: string } | null {
  const bodyTemplate = metadata?.body;
  const toTemplate = metadata?.to;
  const subjectTemplate = metadata?.subject;
  const fromTemplate = metadata?.from;

  if (
    typeof bodyTemplate !== "string" ||
    typeof toTemplate !== "string" ||
    typeof subjectTemplate !== "string" ||
    typeof fromTemplate !== "string"
  ) {
    console.error("Action metadata missing required fields", metadata);
    return null;
  }

  return {
    body: bodyTemplate,
    to: toTemplate,
    subject: subjectTemplate,
    from: fromTemplate,
  };
}
