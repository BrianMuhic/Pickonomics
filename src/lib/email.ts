const RESEND_ENDPOINT = "https://api.resend.com/emails";
const RESEND_BATCH_ENDPOINT = "https://api.resend.com/emails/batch";

/** Resend accepts at most 100 messages per batch request. */
const BATCH_SIZE = 100;

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export function appUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

/** Escapes user-supplied values before they go into an HTML email body. */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fromAddress() {
  return process.env.EMAIL_FROM || "Pickonomics <onboarding@resend.dev>";
}

function payload(message: EmailMessage) {
  return {
    from: fromAddress(),
    to: message.to,
    subject: message.subject,
    html: message.html,
    ...(message.text ? { text: message.text } : {}),
  };
}

/**
 * Sends one email. Without RESEND_API_KEY (local dev) the message is logged
 * instead of sent, and still reported as delivered so flows can be exercised.
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[dev] Email to ${message.to}: ${message.subject}`);
    return true;
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload(message)),
    });

    if (!res.ok) {
      console.error(`Resend send failed (${res.status}):`, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("Resend send error:", e);
    return false;
  }
}

/**
 * Sends many emails using Resend's batch endpoint, which keeps a full league
 * blast within one API request per 100 recipients. Resend rejects a batch
 * outright if any message in it is invalid, so a failed chunk is reported as
 * failed for every recipient in that chunk.
 */
export async function sendEmails(
  messages: EmailMessage[]
): Promise<{ sent: EmailMessage[]; failed: EmailMessage[] }> {
  const sent: EmailMessage[] = [];
  const failed: EmailMessage[] = [];

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const chunk = messages.slice(i, i + BATCH_SIZE);

    if (!process.env.RESEND_API_KEY) {
      for (const message of chunk) {
        console.log(`[dev] Email to ${message.to}: ${message.subject}`);
      }
      sent.push(...chunk);
      continue;
    }

    try {
      const res = await fetch(RESEND_BATCH_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chunk.map(payload)),
      });

      if (res.ok) {
        sent.push(...chunk);
      } else {
        console.error(`Resend batch failed (${res.status}):`, await res.text());
        failed.push(...chunk);
      }
    } catch (e) {
      console.error("Resend batch error:", e);
      failed.push(...chunk);
    }
  }

  return { sent, failed };
}
