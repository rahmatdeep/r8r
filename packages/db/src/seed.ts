import { PrismaClient } from "@prisma/client";
import "dotenv/config";
const prismaClient = new PrismaClient();

(async () => {
  await prismaClient.availableTriggers.createMany({
    data: [
      {
        id: "webhook",
        name: "Webhook",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ1br_iLWHygV0qvoSqHxdotYCI-vLaR4owg&s",
      },
      {
        id: "form",
        name: "Form",
        image: "",
      },
    ],
  });

  await prismaClient.availableActions.createMany({
    data: [
      {
        id: "email",
        name: "Email",
        image:
          "https://t3.ftcdn.net/jpg/01/70/65/08/360_F_170650817_gT28zz1u3arUvEqdYp7YpuTfVTiGoAJL.jpg",
      },
      {
        id: "telegram",
        name: "Telegram",
        image:
          "https://cdn.pixabay.com/photo/2021/12/27/10/50/telegram-6896827_1280.png",
      },
      {
        id: "gemini",
        name: "Gemini",
        image: "empty",
      },
      {
        id: "solana",
        name: "Solana",
        image: "empty",
      },
      {
        id: "gmail",
        name: "Gmail",
        image: "empty",
      },
    ],
  });
})();
