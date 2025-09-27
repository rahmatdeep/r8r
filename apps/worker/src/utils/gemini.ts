import { GoogleGenAI } from "@google/genai";
import { updateErrorDB, validateCredentials } from "./validate";
import { parse } from "./parser";

export async function processGemini(
  credentials: any,
  currentAction: any,
  workflowRunMetadata: any,
  workflowRunId: string
) {
  const apiKey = validateCredentials(credentials, "gemini");
  if (!apiKey) {
    await updateErrorDB(
      workflowRunId,
      "No gemini credentials found for the user"
    );
    return;
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  const message = parse(currentAction.metadata.message, workflowRunMetadata);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: message,
    config: {
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  });
  console.log(response.text);
}
