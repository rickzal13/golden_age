import type { Env } from "../env";

export interface EmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}

export function createEmailClient(_env: Env) {
  return {
    async send(options: EmailOptions): Promise<{ messageId: string }> {
      const response = await fetch("http://localhost:8025/api/v1/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          From: _env.SES_FROM_ADDRESS,
          To: options.to,
          Subject: options.subject,
          HTML: options.htmlBody,
          Text: options.textBody || "",
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }
      const data = (await response.json()) as { ID: string };
      return { messageId: data.ID };
    },
  };
}

export type EmailClient = ReturnType<typeof createEmailClient>;
