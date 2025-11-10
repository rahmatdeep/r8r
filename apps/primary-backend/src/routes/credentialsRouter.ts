import { prisma } from "@repo/db";
import {
  CredentialCreateSchema,
  CredentialDeleteSchema,
  CredentialUpdateSchema,
} from "@repo/types/types";
import { Router } from "express";
import { authMiddlware } from "../middleware";

const router: Router = Router();

router.post("/", authMiddlware, async (req, res) => {
  const parsedData = CredentialCreateSchema.safeParse(req.body);

  if (!parsedData.success || !req.id) {
    res.status(403).json({
      message: "Invalid request data",
    });
    return;
  }

  try {
    await prisma.credentials.create({
      data: {
        platform: parsedData.data.platform,
        title: parsedData.data.title,
        keys: parsedData.data.keys === null ? undefined : parsedData.data.keys, //why are we storing null
        userId: req.id,
      },
    });

    res.json({
      message: "credentials stored successfully",
    });
    return;
  } catch (e) {
    console.error("Error storing credentials", e);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

router.get("/", authMiddlware, async (req, res) => {
  try {
    const credentials = await prisma.credentials.findMany({
      where: {
        userId: req.id,
      },
    });

    res.json({
      credentials,
    });
  } catch (e) {
    console.error("Error fetching credentials", e);
    res.status(500).json({
      message: "Failed to fetch credentials",
    });
  }
});

router.delete("/", authMiddlware, async (req, res) => {
  const parsedData = CredentialDeleteSchema.safeParse(req.body);
  if (!parsedData.success || !req.id) {
    res.status(403).json({
      message: "Invalid request data",
    });
    return;
  }

  try {
    const credentials = await prisma.credentials.findUnique({
      where: {
        id: parsedData.data.credentialsId,
      },
    });

    if (!credentials) {
      res.status(404).json({
        message: "Credentials not found",
      });
      return;
    }

    await prisma.credentials.delete({
      where: {
        id: parsedData.data.credentialsId,
      },
    });

    res.json({
      message: "Credentials deleted successfully",
    });
  } catch (e) {
    console.error("Error deleting credentials", e);
    res.status(500).json({
      message: "Failed to delete credentials",
    });
  }
});

router.put("/", authMiddlware, async (req, res) => {
  const parsedData = CredentialUpdateSchema.safeParse(req.body);

  if (!parsedData.success || !req.id) {
    res.status(403).json({
      message: "Invalid request data",
    });
    return;
  }

  try {
    const credential = await prisma.credentials.findUnique({
      where: { id: parsedData.data.credentialsId },
    });

    if (!credential || credential.userId !== req.id) {
      res.status(404).json({
        message: "Credentials not found or unauthorized",
      });
      return;
    }

    const updateData: any = {};
    if (parsedData.data.title !== undefined) {
      updateData.title = parsedData.data.title;
    }

    if (parsedData.data.keys !== undefined) {
      updateData.keys = parsedData.data.keys;
    }

    await prisma.credentials.update({
      where: { id: parsedData.data.credentialsId },
      data: updateData,
    });

    res.json({
      message: "Credentials updated successfully",
    });
  } catch (e) {
    console.error("Error updating credentials", e);
    res.status(500).json({
      message: "Failed to update credentials",
    });
  }
});

export { router as credentialsRouter };
