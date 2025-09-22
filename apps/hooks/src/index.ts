import express from "express";
import cors from "cors";
import { prisma } from "@repo/db";
import "dotenv/config";
import { deleteData, getData, setData } from "./utils/data";

const app = express();
const HOOKS_PORT = process.env.HOOKS_PORT || 3101;

app.use(cors());
app.use(express.json());

app.all("/hooks/catch/:userId/:workflowId", async (req, res) => {
  const { userId, workflowId } = req.params;
  const { body } = req;
  const exists = await prisma.workflow.findFirst({
    where: {
      userId: userId,
      id: workflowId,
    },
  });

  if (!exists) {
    setData(workflowId, body);
    res.json({
      message: "Test webhook recieved",
    });
    return;
  }

  await prisma.$transaction(async (tx) => {
    const run = await tx.workflowRun.create({
      data: {
        workflowId: workflowId,
        metaData: body,
      },
    });

    await tx.workflowRunOutbox.create({
      data: {
        workflowRunId: run.id,
      },
    });
  });

  res.json({
    message: "Webhook recieved",
  });
});

app.get("/testing", (req, res) => {
  const { workflowId } = req.query;
  const MAX_WAIT = 30000;
  const INTERVAL = 1000;
  let waited = 0;

  function poll() {
    const data = getData(workflowId as string);
    if (data) {
      deleteData(workflowId as string);
      res.json({ data });
    } else if (waited >= MAX_WAIT) {
      res.status(408).json({ message: "Timeout: No data found" });
    } else {
      waited += INTERVAL;
      setTimeout(poll, INTERVAL);
    }
  }

  poll();
});

app.listen(HOOKS_PORT, () =>
  console.log(`hooks server running on ${HOOKS_PORT}`)
);
