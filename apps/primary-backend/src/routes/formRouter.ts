import { prisma } from "@repo/db";
import { Router } from "express";

const router = Router();

router.get("/:id", async (req, res) => {
  const workflowId = req.params.id;

  try {
    const formMetadata = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
      },
      select: {
        trigger: {
          select: {
            metadata: true,
          },
        },
      },
    });
    if (!formMetadata) {
      res.status(404).json({ message: "form not found" });
      return;
    }

    res.json({
      formMetadata,
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

export const formRouter: Router = router;
