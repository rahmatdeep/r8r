import { Router } from "express";
import { SigninSchema, SignupSchema } from "@repo/types/types";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

const router: Router = Router();

router.post("/signup", async (req, res) => {
  const parsedData = SignupSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(411).json({
      message: "Incorrect Inputs",
    });
    return;
  }

  try {
    const userExists = await prisma.user.findFirst({
      where: { email: parsedData.data.email },
    });

    if (userExists) {
      res.status(403).json({
        message: "User already exists",
      });
      return;
    }
  } catch (e) {
    console.log("Error", e);
    res.status(500).json({
      message: "Server Error",
    });
    return;
  }
  try {
    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

    await prisma.user.create({
      data: {
        email: parsedData.data.email,
        password: hashedPassword,
        name: parsedData.data.name,
      },
    });
    res.json({
      message: "Signed up successfully",
    });
    return;
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Error while signing up",
    });
    return;
  }
});

router.post("/signin", async (req, res) => {
  const parsedData = SigninSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(411).json({
      message: "Incorrect Inputs",
    });
    return;
  }
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: parsedData.data.email,
      },
    });

    if (!user) {
      res.status(403).json({
        message: "User does not exist",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      parsedData.data.password,
      user.password
    );

    if (!isPasswordValid) {
      res.status(401).json({
        message: "Password is invalid",
      });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_PASSWORD as string
    );

    res.json({
      message: "Login successful",
      token,
      userId: user.id,
      name: user.name,
    });
    return;
  } catch (e) {
    res.status(500).json({
      message: "Internal Server Error",
    });
    return;
  }
});

export { router as userRouter };
