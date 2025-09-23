import { JsonObject, prisma } from "@repo/db";
import { kafka, TOPIC_NAME } from "@repo/kafka/kafka-client";
import { parse } from "./utils/parser";
import { sendEmail } from "./utils/email";

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
        if (
          !credentials ||
          !credentials.keys ||
          typeof credentials.keys !== "object" ||
          credentials.keys === null ||
          !(credentials.keys as JsonObject).apiKey
        ) {
          console.error("No email credentials found for the user");
          return;
        }
        const apiKey = (credentials.keys as JsonObject).apiKey;

        const bodyTemplate = (currentAction.metadata as JsonObject)?.body;
        const toTemplate = (currentAction.metadata as JsonObject)?.to;
        const subjectTemplate = (currentAction.metadata as JsonObject)?.subject;
        const fromTemplate = (currentAction.metadata as JsonObject)?.from;
        if (
          typeof bodyTemplate !== "string" ||
          typeof toTemplate !== "string" ||
          typeof subjectTemplate !== "string" ||
          typeof fromTemplate !== "string" ||
          typeof apiKey !== "string"
        ) {
          console.error(
            "Action metadata missing required fields",
            currentAction.metadata
          );
          return;
        }
        const body = parse(bodyTemplate, workflowRunMetadata);
        const to = parse(toTemplate, workflowRunMetadata);
        const subject = parse(subjectTemplate, workflowRunMetadata);
        const from = parse(fromTemplate, workflowRunMetadata);
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
