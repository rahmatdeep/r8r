import axios from "axios";
import {
  updateErrorDB,
  validateCredentials,
  validateTelegramMetadata,
} from "./validate";
import { JsonObject } from "@repo/db";
import { parse } from "./parser";
async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string,
  workflowRunId: string
) {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return { success: true, data: response.data };
  } catch (e: any) {
    const errorMsg =
      e.response?.data?.description || e.message || "Unknown error";
    console.error(`Error sending telegram message: ${errorMsg}`);
    await updateErrorDB(
      workflowRunId,
      `Error sending telegram message: ${errorMsg}`
    );
    return { success: false, error: errorMsg };
  }
}

export async function processTelegram(
  credentials: any,
  currentAction: any,
  workflowRunMetadata: any,
  workflowRunId: string
) {
  const apiKey = validateCredentials(credentials, "telegram");
  if (!apiKey) {
    await updateErrorDB(
      workflowRunId,
      "No telegram credentials found for the user"
    );
    return;
  }

  const metadataResult = validateTelegramMetadata(
    currentAction.metadata as JsonObject
  );
  if (!metadataResult.valid) {
    await updateErrorDB(
      workflowRunId,
      `Telegram Action metadata missing required fields: ${metadataResult.missingFields.join(
        ", "
      )}`
    );
    return;
  }
  const { chatId, message } = metadataResult.value;

  const telegramResponse = await sendTelegramMessage(
    apiKey,
    chatId,
    parse(message, workflowRunMetadata),
    workflowRunId
  );

  if (!telegramResponse?.success) {
    return;
  }

  console.log("Telegram message sent successfully:", telegramResponse.data);
}
