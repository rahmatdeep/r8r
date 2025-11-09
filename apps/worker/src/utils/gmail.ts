import nodemailer from "nodemailer";
import {
  updateErrorDB,
  validateEmailMetadata,
  validateGmailCredentials,
} from "./validate";
import { JsonObject } from "@repo/db";
import { parse } from "./parser";

async function sendGmail(
  credentials: { user: string; pass: string },
  to: string,
  subject: string,
  body: string,
  from: string
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: credentials.user,
      pass: credentials.pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `<${from}>`,
      to: to,
      subject: subject,
      text: body,
      html: `<html>
      <body>
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
          <h2>${subject}</h2>
          <p>${body}</p>
          <footer style="margin-top: 20px; font-size: 12px; color: #888;">
            <p>Thank you,</p>
            <p>The Team</p>
          </footer>
        </div>
      </body>
    </html>`,
    });
    console.log("Email sent successfully: ", info.messageId);
    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err };
  }
}

export async function processGmail(
  credentials: any,
  currentAction: any,
  workflowRunMetadata: any,
  workflowRunId: string
) {
  const validation = validateGmailCredentials(credentials);

  if (!validation.valid) {
    await updateErrorDB(
      workflowRunId,
      "No gmail credentials found for the user"
    );
    return;
  }

  const metadataResult = validateEmailMetadata(
    currentAction.metadata as JsonObject
  );
  if (!metadataResult.valid) {
    await updateErrorDB(
      workflowRunId,
      `Email Action metadata missing required fields: ${metadataResult.missingFields.join(", ")}`
    );
    return;
  }
  const body = parse(metadataResult.value.body, workflowRunMetadata);
  const to = parse(metadataResult.value.to, workflowRunMetadata);
  const subject = parse(metadataResult.value.subject, workflowRunMetadata);
  const from = parse(metadataResult.value.from, workflowRunMetadata);

  try {
    const gmailResponse = await sendGmail(
      validation.value,
      to,
      subject,
      body,
      from
    );

    if (!gmailResponse.success) {
      const errorMsg =
        gmailResponse.error &&
        typeof gmailResponse.error === "object" &&
        "message" in gmailResponse.error
          ? gmailResponse.error.message
          : String(gmailResponse.error);

      console.error("Failed to send email:", errorMsg);
      await updateErrorDB(workflowRunId, `Failed to send email: ${errorMsg}`);
      return;
    }

    console.log(`Email sent succesfully to: ${to}`);
  } catch (err) {
    console.error("Failed to send email:", err);
    await updateErrorDB(workflowRunId, `Failed to send email: ${err}`);
  }
}
