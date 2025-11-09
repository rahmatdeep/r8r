import { Router } from "express";
import { authMiddlware } from "../middleware";
import {
  EmailActionMetadataSchema,
  GeminiActionMetadataSchema,
  TelegramActionMetadataSchema,
  WorkflowCreateSchema,
  WorkflowUpdateSchema,
  SolanaMetadataSchema,
} from "@repo/types/types";
import { prisma } from "@repo/db";

const router: Router = Router();

router.post("/", authMiddlware, async (req, res) => {
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
        id: parsedData.data.id,
        title: parsedData.data.title,
        trigger: {
          create: {
            availableTriggersId: parsedData.data.availableTriggerId,
            metadata: parsedData.data.triggerMetadata || {},
          },
        },
        action: {
          create: parsedData.data.actions.map((x, index) => {
            if (x.availableActionId === "email") {
              const emailMetadataValidation =
                EmailActionMetadataSchema.safeParse(x.actionMetadata);
              if (!emailMetadataValidation.success) {
                res.status(400).json({
                  message: "Invalid email action metadata",
                  errors: emailMetadataValidation.error.issues,
                });
                throw new Error("Validation failed");
              }
            }
            if (x.availableActionId === "telegram") {
              const telegramMetadataValidation =
                TelegramActionMetadataSchema.safeParse(x.actionMetadata);
              if (!telegramMetadataValidation.success) {
                res.status(400).json({
                  message: "Invalid telegram action metadata",
                  errors: telegramMetadataValidation.error.issues,
                });
                throw new Error("Validation failed");
              }
            }
            if (x.availableActionId === "gemini") {
              const geminiMetadataValidation =
                GeminiActionMetadataSchema.safeParse(x.actionMetadata);
              if (!geminiMetadataValidation.success) {
                res.status(400).json({
                  message: "Invalid gemini action metadata",
                  errors: geminiMetadataValidation.error.issues,
                });
                throw new Error("Validation failed");
              }
            }
            if (x.availableActionId === "solana") {
              const solanaMetadataValidation = SolanaMetadataSchema.safeParse(
                x.actionMetadata
              );
              if (!solanaMetadataValidation.success) {
                res.status(400).json({
                  message: "Invalid solana action metadata",
                  errors: solanaMetadataValidation.error.issues,
                });
                throw new Error("Validation failed");
              }
            }
            return {
              availableActionsId: x.availableActionId,
              sortingOrder: index,
              metadata: x.actionMetadata,
            };
          }),
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
router.get("/", authMiddlware, async (req, res) => {
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
router.get("/status", authMiddlware, async (req, res) => {
  if (!req.id) {
    return;
  }
  try {
    const workflowRun = await prisma.workflowRun.findMany({
      where: {
        workflow: {
          userId: req.id,
        },
      },
    });
    res.json({
      workflowRun,
    });
  } catch (e) {
    console.error("Error deleting workflow:", e);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});
router.get("/:id", authMiddlware, async (req, res) => {
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
router.put("/:id", authMiddlware, async (req, res) => {
  const parsedData = WorkflowUpdateSchema.safeParse(req.body);
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
    await prisma.$transaction(async (tx) => {
      await tx.workflow.update({
        where: { id: workflowId },
        data: { title: parsedData.data.title },
      });

      await tx.trigger.deleteMany({ where: { workflowId } });
      await tx.action.deleteMany({ where: { workflowId } });

      await tx.trigger.create({
        data: {
          availableTriggersId: parsedData.data.availableTriggerId,
          workflowId,
          metadata: parsedData.data.triggerMetadata || {},
        },
      });

      for (const [index, x] of parsedData.data.actions.entries()) {
        if (x.availableActionId === "email") {
          const emailMetadataValidation = EmailActionMetadataSchema.safeParse(
            x.actionMetadata
          );
          if (!emailMetadataValidation.success) {
            res.status(400).json({
              message: "Invalid email action metadata",
              errors: emailMetadataValidation.error.issues,
            });
            return;
          }
        }
        if (x.availableActionId === "telegram") {
          const telegramMetadataValidation =
            TelegramActionMetadataSchema.safeParse(x.actionMetadata);
          if (!telegramMetadataValidation.success) {
            res.status(400).json({
              message: "Invalid telegram action metadata",
              errors: telegramMetadataValidation.error.issues,
            });
            return;
          }
        }
        if (x.availableActionId === "gemini") {
          const geminiMetadataValidation = GeminiActionMetadataSchema.safeParse(
            x.actionMetadata
          );
          if (!geminiMetadataValidation.success) {
            res.status(400).json({
              message: "Invalid gemini action metadata",
              errors: geminiMetadataValidation.error.issues,
            });
            return;
          }
        }
        if (x.availableActionId === "solana") {
          const solanaMetadataValidation = SolanaMetadataSchema.safeParse(
            x.actionMetadata
          );
          if (!solanaMetadataValidation.success) {
            res.status(400).json({
              message: "Invalid solana action metadata",
              errors: solanaMetadataValidation.error.issues,
            });
            return;
          }
        }
      }

      await Promise.all(
        parsedData.data.actions.map((x, index) =>
          tx.action.create({
            data: {
              workflowId,
              availableActionsId: x.availableActionId,
              sortingOrder: index,
              metadata: x.actionMetadata,
            },
          })
        )
      );
    });

    res.json({
      message: "Workflow updated successfully",
    });
  } catch (e) {
    console.error("Error updating workflow:", e);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});
router.delete("/:id", authMiddlware, async (req, res) => {
  const workflowId = req.params.id;

  try {
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
    await prisma.trigger.deleteMany({ where: { workflowId } });
    await prisma.action.deleteMany({ where: { workflowId } });
    await prisma.workflowRun.deleteMany({ where: { workflowId } });
    await prisma.workflow.delete({ where: { id: workflowId } });
    res.json({
      message: "Workflow deleted successfully",
    });
  } catch (e) {
    console.error("Error deleting workflow:", e);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export { router as workflowRouter };
