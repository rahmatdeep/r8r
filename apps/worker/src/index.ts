import { JsonObject, prisma } from "@repo/db";
import { kafka, TOPIC_NAME } from "@repo/kafka/kafka-client";
import { parse } from "./utils/parser";
import { processTelegram, sendTelegramMessage } from "./utils/telegram";
import {
  validateCredentials,
  validateTelegramMetadata,
  validateEmailMetadata,
} from "./utils/validate";
import { processEmail } from "./utils/email";

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

      const credentials = workflowRunDetails?.workflow.user.Credentials.find(
        (cred) =>
          cred.id ===
          (currentAction?.metadata as { credentialId?: string })?.credentialId
      );
      console.log(credentials);
      if (currentAction.type.id === "email") {
        await processEmail(credentials, currentAction, workflowRunMetadata);
      }

      if (currentAction.type.id === "telegram") {
        await processTelegram(credentials, currentAction, workflowRunMetadata);
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
