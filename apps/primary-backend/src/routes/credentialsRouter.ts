import { prisma } from "@repo/db";
import {
  CredentialCreateSchema,
  CredentialDeleteSchema,
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
        keys: parsedData.data.keys === null ? undefined : parsedData.data.keys,
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

export { router as credentialsRouter };
