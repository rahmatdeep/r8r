import { prisma } from "@repo/db";
import { Router } from "express";

const router = Router();

router.get("/available", async (req, res) => {
  try {
    const availableTriggers = await prisma.availableTriggers.findMany({});
    res.json({
      availableTriggers,
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

export const triggerRouter: Router = router;
