import axios from "axios";
import { validateCredentials, validateTelegramMetadata } from "./validate";
import { JsonObject } from "@repo/db";
import { parse } from "./parser";
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string
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
    return response.data;
  } catch (e: any) {
    console.error(
      `Error sending telegram message: ${e.response.data || e.message}`
    );
    throw new Error("Failed to send message");
  }
}

export async function processTelegram(credentials: any, currentAction: any, workflowRunMetadata: any){
  const apiKey = validateCredentials(credentials, "telegram");
          if (!apiKey) return;
  
          const metadata = validateTelegramMetadata(
            currentAction.metadata as JsonObject
          );
          if (!metadata) return;
  
          const message = parse(metadata.message, workflowRunMetadata);
  
          try {
            const telegramResponse = await sendTelegramMessage(
              apiKey,
              metadata.chatId,
              message
            );
            console.log("Telegram message sent successfully:", telegramResponse);
          } catch (error) {
            console.error("Failed to send telegram message:", error);
          }
}
