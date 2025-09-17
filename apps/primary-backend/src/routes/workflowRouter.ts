import { Router } from "express";
import { authMiddlware } from "../middleware";
import { WorkflowCreateSchema } from "@repo/types/types";
import { prisma } from "@repo/db";

const router: Router = Router();

router.post("/workflow", authMiddlware, async (req, res) => {
  const parsedData = WorkflowCreateSchema.safeParse(req.body);

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
      message: "Internal Servor Error",
    });
  }
});
router.get("/workflow", authMiddlware, async (req, res) => {
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
});
router.get("/workflow/:id", authMiddlware, async (req, res) => {
  const workflowId = req.params.workflowId;

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
      message: "Internal Servor Error",
    });
    return;
  }
});
// router.put("/workflow/:id", authMiddlware, async (req, res) => {
//   const workflowId = req.params.workflowId;

//   prisma.workflow.update({
//     where: {
//       userId: req.id,
//       id: workflowId,
//     },
//     data: {},
//   });
// });

export { router as workflowRouter };
