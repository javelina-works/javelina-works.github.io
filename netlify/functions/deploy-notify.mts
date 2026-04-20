import type { Context } from "@netlify/functions";
import { ensureSentry } from "./_shared/sentry";

interface NetlifyDeployPayload {
  id?: string;
  state?: string;
  name?: string;
  url?: string;
  ssl_url?: string;
  deploy_ssl_url?: string;
  admin_url?: string;
  branch?: string;
  commit_ref?: string;
  commit_url?: string;
  title?: string;
  error_message?: string;
  created_at?: string;
  deploy_time?: number;
  context?: string;
}

const STATE_COLOR: Record<string, number> = {
  ready: 3066993,
  error: 15158332,
  building: 3447003,
};

const STATE_TITLE: Record<string, string> = {
  ready: "Deploy succeeded",
  error: "Deploy failed",
  building: "Deploy started",
};

function buildEmbed(payload: NetlifyDeployPayload): Record<string, unknown> {
  const state = payload.state ?? "unknown";
  const title = STATE_TITLE[state] ?? `Deploy event: ${state}`;
  const color = STATE_COLOR[state] ?? 9807270;

  const fields: Array<{ name: string; value: string; inline?: boolean }> = [];
  if (payload.branch) fields.push({ name: "Branch", value: payload.branch, inline: true });
  if (payload.context) fields.push({ name: "Context", value: payload.context, inline: true });
  if (typeof payload.deploy_time === "number") {
    fields.push({ name: "Build time", value: `${payload.deploy_time}s`, inline: true });
  }
  if (payload.title) {
    fields.push({ name: "Commit", value: payload.title.slice(0, 1000) });
  }
  if (payload.commit_ref && payload.commit_url) {
    fields.push({
      name: "Ref",
      value: `[\`${payload.commit_ref.slice(0, 7)}\`](${payload.commit_url})`,
      inline: true,
    });
  }
  if (payload.admin_url && payload.id) {
    fields.push({
      name: "Netlify",
      value: `[Deploy log](${payload.admin_url}/deploys/${payload.id})`,
      inline: true,
    });
  }
  if (state === "error" && payload.error_message) {
    fields.push({ name: "Error", value: payload.error_message.slice(0, 1000) });
  }

  return {
    title,
    color,
    fields,
    timestamp: payload.created_at ?? new Date().toISOString(),
  };
}

export default async (req: Request, _context: Context) => {
  const Sentry = ensureSentry();

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhookUrl = process.env.DISCORD_MONITORING_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn(
      "DISCORD_MONITORING_WEBHOOK_URL is not set — skipping Discord notification",
    );
    return new Response("OK", { status: 200 });
  }

  let payload: NetlifyDeployPayload;
  try {
    payload = await req.json();
  } catch (err) {
    console.error("Failed to parse deploy-notify payload");
    Sentry.captureException(err, { tags: { fn: "deploy-notify", stage: "parse" } });
    await Sentry.flush(2000);
    return new Response("Bad request", { status: 400 });
  }

  console.log(`[deploy-notify] state=${payload.state} branch=${payload.branch}`);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [buildEmbed(payload)] }),
    });
    if (!response.ok) {
      console.error(
        `Discord webhook returned ${response.status}: ${await response.text()}`,
      );
    }
  } catch (err) {
    console.error("Discord notification failed:", err);
    Sentry.captureException(err, { tags: { fn: "deploy-notify", stage: "discord" } });
  }

  await Sentry.flush(2000);
  return new Response("OK", { status: 200 });
};
