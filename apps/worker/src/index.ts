import { JsonObject, prisma } from "@repo/db";
import { kafka, TOPIC_NAME } from "@repo/kafka/kafka-client";
import { parse } from "./utils/parser";
import { sendEmail } from "./utils/email";
import { sendTelegramMessage } from "./utils/telegram";
import {
  validateCredentials,
  validateTelegramMetadata,
  validateEmailMetadata,
} from "./utils/validate";

(async () => {
  const consumer = kafka.consumer({ groupId: "main-worker" });
  await consumer.connect();
  const producer = kafka.producer();
  await producer.connect();

  await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      });
      if (!message.value?.toString()) {
        return;
      }
      const parsedValue = JSON.parse(message.value?.toString());
      const workflowRunId = parsedValue.workflowRunId;
      const stage = parsedValue.stage;

      const workflowRunDetails = await prisma.workflowRun.findFirst({
        where: {
          id: workflowRunId,
        },
        include: {
          workflow: {
            include: {
              action: {
                include: {
                  type: true,
                },
              },
              user: {
                include: {
                  Credentials: true,
                },
              },
            },
          },
        },
      });

      const currentAction = workflowRunDetails?.workflow.action.find(
        (x) => x.sortingOrder === stage
      );
      if (!currentAction) {
        console.log("Current action not found");
        return;
      }

      const workflowRunMetadata = workflowRunDetails?.metaData;

      if (currentAction.type.id === "email") {
        const credentials = workflowRunDetails?.workflow.user.Credentials.find(
          (cred) => cred.platform === "email"
        );
        const apiKey = validateCredentials(credentials, "email");
        if (!apiKey) return;

        const metadata = validateEmailMetadata(
          currentAction.metadata as JsonObject
        );
        if (!metadata) return;

        const body = parse(metadata.body, workflowRunMetadata);
        const to = parse(metadata.to, workflowRunMetadata);
        const subject = parse(metadata.subject, workflowRunMetadata);
        const from = parse(metadata.from, workflowRunMetadata);

        try {
          const emailResponse = await sendEmail(
            { apiKey },
            to,
            subject,
            body,
            from
          );

          if (!emailResponse.success) {
            console.error("Failed to send email:", emailResponse.error);
            return;
          }

          console.log(`Email sent successfully to: ${to}`);
        } catch (error) {
          console.error("Failed to send email:", error);
        }
      }

      if (currentAction.type.id === "telegram") {
        const credentials = workflowRunDetails?.workflow.user.Credentials.find(
          (cred) => cred.platform === "telegram"
        );
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

      await new Promise((r) => setTimeout(r, 1000));

      const lastStage = (workflowRunDetails?.workflow.action.length || 1) - 1;
      if (lastStage !== stage) {
        await producer.send({
          topic: TOPIC_NAME,
          messages: [
            {
              value: JSON.stringify({
                stage: stage + 1,
                workflowRunId,
              }),
            },
          ],
        });
      }

      await consumer.commitOffsets([
        {
          topic: TOPIC_NAME,
          partition,
          offset: (parseInt(message.offset) + 1).toString(),
        },
      ]);
    },
  });
})();
