import { GoogleGenAI } from "@google/genai";
import {
  updateErrorDB,
  validateCredentials,
  validateGeminiMetadata,
} from "./validate";
import { parse } from "./parser";
import { JsonObject, prisma } from "@repo/db";

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

  const metadataResult = validateGeminiMetadata(
    currentAction.metadata as JsonObject
  );
  if (!metadataResult.valid) {
    await updateErrorDB(
      workflowRunId,
      `Gemini Action metadata missing required fields: ${metadataResult.missingFields.join(", ")}`
    );
    return;
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  const message = parse(metadataResult.value.message, workflowRunMetadata);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });
    console.log(
      `GEMINI Response: ${response.candidates?.[0]?.content?.parts?.[0]?.text}`
    );
    const updatedMetadata = {
      ...workflowRunMetadata,
      geminiResponse: response.candidates?.[0]?.content?.parts?.[0]?.text,
    };
    await prisma.workflowRun.update({
      where: {
        id: workflowRunId,
      },
      data: {
        metaData: updatedMetadata,
      },
    });
  } catch (error: any) {
    console.error("Gemini API error:", error?.message || error);
    await updateErrorDB(
      workflowRunId,
      `Gemini API error: ${error?.message || error}`
    );
  }
}
