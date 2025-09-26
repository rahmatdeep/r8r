import { Resend } from "resend";
import { validateCredentials, validateEmailMetadata } from "./validate";
import { parse } from "./parser";
import { JsonObject } from "@repo/db";

async function sendEmail(
  credentials: { apiKey: string },
  to: string,
  subject: string,
  body: string,
  from: string
) {
  const resend = new Resend(credentials.apiKey);

  const defaultHtml = `
    <html>
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
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html: defaultHtml,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err };
  }
}

export async function processEmail(
  credentials: any,
  currentAction: any,
  workflowRunMetadata: any
) {
  const apiKey = validateCredentials(credentials, "email");
  if (!apiKey) return;

  const metadata = validateEmailMetadata(currentAction.metadata as JsonObject);
  if (!metadata) return;

  const body = parse(metadata.body, workflowRunMetadata);
  const to = parse(metadata.to, workflowRunMetadata);
  const subject = parse(metadata.subject, workflowRunMetadata);
  const from = parse(metadata.from, workflowRunMetadata);

  try {
    const emailResponse = await sendEmail({ apiKey }, to, subject, body, from);

    if (!emailResponse.success) {
      console.error("Failed to send email:", emailResponse.error);
      return;
    }

    console.log(`Email sent successfully to: ${to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
