import nodemailer from "nodemailer";
import { updateErrorDB, validateGmailCredentials } from "./validate";

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
}

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
    return { success: false };
  }
}
