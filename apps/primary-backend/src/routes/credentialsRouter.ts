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
      message: "Invalid types",
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
  const credentials = await prisma.credentials.findMany({
    where: {
      userId: req.id,
    },
  });

  res.json({
    credentials,
  });
  return;
});

router.delete("/", authMiddlware, async (req, res) => {
  const parsedData = CredentialDeleteSchema.safeParse(req.body);
  if (!parsedData.success || !req.id) {
    res.status(403).json({
      message: "Invalid types",
    });
    return;
  }

  const credentials = await prisma.credentials.findUnique({
    where: {
      id: parsedData.data.credentialsId,
    },
  });

  if (!credentials) {
    res.status(403).json({
      message: "No such credentials exist",
    });
    return;
  } else {
    await prisma.credentials.delete({
      where: {
        id: parsedData.data.credentialsId,
      },
    });

    res.json({
      message: `credentials deleted successfully`,
    });
    return;
  }
});

export { router as credentialsRouter };
