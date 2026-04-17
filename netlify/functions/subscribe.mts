import type { Context } from "@netlify/functions";

interface SubscribeBody {
  email: string;
  privacyConsent: boolean;
  botField?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function submitToNetlifyForms(email: string): Promise<void> {
  const siteUrl = process.env.URL;
  if (!siteUrl) {
    throw new Error("URL environment variable is not set");
  }

  const body = new URLSearchParams({
    "form-name": "subscription-form",
    email,
    "privacy-consent": "true",
  }).toString();

  const response = await fetch(siteUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Netlify Forms returned ${response.status}`);
  }
}

async function notifyDiscord(email: string): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("DISCORD_WEBHOOK_URL is not set — skipping Discord notification");
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: "New Subscription",
          fields: [{ name: "Email", value: email }],
          timestamp: new Date().toISOString(),
          color: 0x2ecc71,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error(`Discord webhook returned ${response.status}`);
  }
}

async function submitToEsp(email: string): Promise<void> {
  console.log(`[ESP stub] ${new Date().toISOString()} — would submit: ${email}`);
}

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: SubscribeBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (body.botField) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body.email || !body.privacyConsent) {
    return new Response(
      JSON.stringify({ success: false, error: "Email and privacy consent are required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    await submitToNetlifyForms(body.email);
  } catch (err) {
    console.error("Netlify Forms submission failed:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to save subscription" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  await Promise.allSettled([notifyDiscord(body.email), submitToEsp(body.email)]);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};
