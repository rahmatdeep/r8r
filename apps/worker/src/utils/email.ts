import { Resend } from "resend";

export async function sendEmail(
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
