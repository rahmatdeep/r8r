import axios from "axios";
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
