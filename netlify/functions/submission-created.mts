import type { Context } from "@netlify/functions";
import { ensureSentry } from "./_shared/sentry";

interface NetlifyFormPayload {
  payload: {
    form_name: string;
    data: Record<string, string>;
    created_at: string;
  };
}

async function notifyDiscord(
  formName: string,
  data: Record<string, string>,
  createdAt: string,
): Promise<void> {
  // Fallback to DISCORD_WEBHOOK_URL keeps submissions flowing during the rename rollout.
  // Remove the fallback once DISCORD_SUBMISSIONS_WEBHOOK_URL is set in Netlify.
  const webhookUrl =
    process.env.DISCORD_SUBMISSIONS_WEBHOOK_URL ?? process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn(
      "DISCORD_SUBMISSIONS_WEBHOOK_URL is not set — skipping Discord notification",
    );
    return;
  }

  const embeds: Record<string, unknown>[] = [];

  if (formName === "contact-form") {
    const name = data["Full Name"] || "Unknown";
    const email = data["Email Address"] || "Unknown";
    const subject = data["Contact Subject"] || "Not specified";
    const message = data["Message"] || "No message";
    const source = data["User Source"] || "Not specified";

    embeds.push({
      title: "New Contact Form Submission",
      color: 3447003,
      fields: [
        { name: "Name", value: name, inline: true },
        { name: "Email", value: email, inline: true },
        { name: "Subject", value: subject, inline: true },
        { name: "How They Found Us", value: source, inline: true },
        { name: "Message", value: message },
      ],
      timestamp: createdAt || new Date().toISOString(),
    });
  } else if (formName === "subscription-form") {
    embeds.push({
      title: "New Newsletter Subscriber",
      color: 5814783,
      fields: [
        { name: "Email", value: data["email"] || "Unknown", inline: true },
        { name: "Source", value: "Footer form", inline: true },
      ],
      timestamp: createdAt || new Date().toISOString(),
    });
  } else {
    embeds.push({
      title: `New Form Submission: ${formName}`,
      color: 9807270,
      fields: Object.entries(data)
        .filter(([key]) => !key.startsWith("form-name"))
        .map(([key, value]) => ({ name: key, value: value || "—", inline: true })),
      timestamp: createdAt || new Date().toISOString(),
    });
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds }),
  });

  if (!response.ok) {
    console.error(`Discord webhook returned ${response.status}: ${await response.text()}`);
  }
}

export default async (req: Request, _context: Context) => {
  const Sentry = ensureSentry();

  let event: NetlifyFormPayload;
  try {
    event = await req.json();
  } catch (err) {
    console.error("Failed to parse submission-created payload");
    Sentry.captureException(err, { tags: { fn: "submission-created", stage: "parse" } });
    await Sentry.flush(2000);
    return new Response("Bad request", { status: 400 });
  }

  const { form_name, data, created_at } = event.payload;
  console.log(`[submission-created] Form: ${form_name}, Time: ${created_at}`);

  try {
    await notifyDiscord(form_name, data, created_at);
  } catch (err) {
    console.error("Discord notification failed:", err);
    Sentry.captureException(err, {
      tags: { fn: "submission-created", form: form_name },
    });
  }

  await Sentry.flush(2000);
  return new Response("OK", { status: 200 });
};
