import { JsonObject, prisma } from "@repo/db";
import { kafka, TOPIC_NAME } from "@repo/kafka/kafka-client";
import { parse } from "./utils/parser";

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
        const body = parse(
          (currentAction.metadata as JsonObject)?.body as string,
          workflowRunMetadata
        );
        const to = parse(
          (currentAction.metadata as JsonObject)?.email as string,
          workflowRunMetadata
        );
        console.log(`Sending email to: ${to}, with the body ${body}`);
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
