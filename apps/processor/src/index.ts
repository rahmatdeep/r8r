import { prisma } from "@repo/db";
import { kafka, TOPIC_NAME } from "@repo/kafka/kafka-client";
(async () => {
  const producer = kafka.producer();
  await producer.connect();

  while (true) {
    try {
      const pendingRows = await prisma.workflowRunOutbox.findMany({
        where: {},
        take: 10,
      });
      producer.send({
        topic: TOPIC_NAME,
        messages: pendingRows.map((r) => {
          return {
            value: JSON.stringify({ workflowRunId: r.workflowRunId, stage: 0 }),
          };
        }),
      });

      await prisma.workflowRunOutbox.deleteMany({
        where: {
          id: {
            in: pendingRows.map((r) => r.id),
          },
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
})();
