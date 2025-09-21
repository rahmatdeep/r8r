import { Router } from "express";
import { authMiddlware } from "../middleware";
import { WorkflowSchema } from "@repo/types/types";
import { prisma } from "@repo/db";

const router: Router = Router();

router.post("/workflow", authMiddlware, async (req, res) => {
  const parsedData = WorkflowSchema.safeParse(req.body);

  if (!parsedData.success || !req.id) {
    res.status(411).json({
      message: "Invalid Inputs",
    });
    return;
  }
  try {
    await prisma.workflow.create({
      data: {
        userId: req.id,
        title: parsedData.data.title,
        trigger: {
          create: {
            availableTriggersId: parsedData.data.availableTriggerId,
          },
        },
        action: {
          create: parsedData.data.actions.map((x, index) => ({
            availableActionsId: x.availableActionId,
            sortingOrder: index,
            metadata: x.actionMetadata,
          })),
        },
      },
    });

    res.json({
      message: "Workflow created successfully",
    });
    return;
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});
router.get("/workflow", authMiddlware, async (req, res) => {
  try {
    const workflows = await prisma.workflow.findMany({
      where: {
        userId: req.id,
      },
      include: {
        action: {
          include: {
            type: true,
          },
        },
        trigger: {
          include: {
            type: true,
          },
        },
      },
    });

    res.json({
      workflows,
    });
    return;
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});
router.get("/workflow/:id", authMiddlware, async (req, res) => {
  const workflowId = req.params.id;

  try {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: req.id,
      },
      include: {
        action: {
          include: {
            type: true,
          },
        },
        trigger: {
          include: {
            type: true,
          },
        },
      },
    });
    res.json({
      workflow,
    });
    return;
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Internal Server Error",
    });
    return;
  }
});
router.put("/workflow/:id", authMiddlware, async (req, res) => {
  const parsedData = WorkflowSchema.safeParse(req.body);
  const workflowId = req.params.id;

  if (!parsedData.success || !req.id || !workflowId) {
    res.status(411).json({
      message: "Invalid Inputs",
    });
    return;
  }
  const validate = await prisma.workflow.findFirst({
    where: {
      userId: req.id,
      id: workflowId,
    },
  });
  if (!validate) {
    res.status(403).json({
      message: "This workflow does not belong to this userId",
    });
    return;
  }
  try {
    await prisma.workflow.update({
      where: {
        id: workflowId,
      },
      data: {
        title: parsedData.data.title,
      },
    });

    await prisma.trigger.deleteMany({ where: { workflowId } });
    await prisma.action.deleteMany({ where: { workflowId } });

    await prisma.trigger.create({
      data: {
        availableTriggersId: parsedData.data.availableTriggerId,
        workflowId,
      },
    });

    await Promise.all(
      parsedData.data.actions.map((x, index) =>
        prisma.action.create({
          data: {
            workflowId,
            availableActionsId: x.availableActionId,
            sortingOrder: index,
            metadata: x.actionMetadata,
          },
        })
      )
    );

    res.json({
      message: "Workflow updated",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export { router as workflowRouter };
