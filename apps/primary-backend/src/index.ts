import express from "express";
import cors from "cors";
import { userRouter } from "./routes/userRouter";
import "dotenv/config";

const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 3100;

app.use(express.json());
app.use(cors());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/workflow", workflowRouter);
app.use("/api/v1/credentials", credentialsRouter);

app.listen(HTTP_PORT, () => {
  console.log(`process is running on ${HTTP_PORT}`);
});
