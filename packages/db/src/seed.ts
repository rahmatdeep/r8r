import { prisma } from "@repo/db";

(async () => {
  await prisma.availableTriggers.create({
    data: {
      id: "webhook",
      name: "Webhook",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ1br_iLWHygV0qvoSqHxdotYCI-vLaR4owg&s",
    },
  });

  await prisma.availableActions.createMany({
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
    ],
  });
})();
