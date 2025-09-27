import { prisma } from "@repo/db";
import { kafka, TOPIC_NAME } from "@repo/kafka/kafka-client";
import { processTelegram } from "./utils/telegram";
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
      if (workflowRunDetails?.status === "Error") {
        return;
      }
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
      switch (currentAction.type.id) {
        case "email":
          await processEmail(
            credentials,
            currentAction,
            workflowRunMetadata,
            workflowRunId
          );
          break;
        case "telegram":
          await processTelegram(
            credentials,
            currentAction,
            workflowRunMetadata,
            workflowRunId
          );
          break;
        default:
          console.log("Unknown action selected");
      }

      await new Promise((r) => setTimeout(r, 1000));

      const lastStage = (workflowRunDetails?.workflow.action.length || 1) - 1;

      const latestRun = await prisma.workflowRun.findUnique({
        where: { id: workflowRunId },
        select: { status: true },
      });
      if (lastStage === stage && latestRun?.status !== "Error") {
        await prisma.workflowRun.update({
          where: { id: workflowRunId },
          data: { status: "Complete", finishedAt: new Date() },
        });
      }
      if (lastStage !== stage && latestRun?.status !== "Error") {
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
