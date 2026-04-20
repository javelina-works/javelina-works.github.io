import type { Context } from "@netlify/functions";

// Named "monitoring" rather than "sentry-*" so ad-blocker URL heuristics don't
// match the tunnel the way they match ingest.sentry.io.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const configuredDsn = process.env.PUBLIC_SENTRY_DSN;
  if (!configuredDsn) {
    console.error("PUBLIC_SENTRY_DSN is not set");
    return new Response("Tunnel not configured", { status: 500, headers: corsHeaders });
  }

  let allowedHost: string;
  let allowedProjectId: string;
  try {
    const allowed = new URL(configuredDsn);
    allowedHost = allowed.hostname;
    allowedProjectId = allowed.pathname.replace(/^\//, "");
  } catch {
    console.error("PUBLIC_SENTRY_DSN is not a valid URL");
    return new Response("Tunnel not configured", { status: 500, headers: corsHeaders });
  }

  const envelope = await req.text();
  const [headerLine] = envelope.split("\n", 1);

  // Refuse to forward anything that doesn't match our DSN, so this endpoint
  // can't be abused as an open relay into arbitrary Sentry projects.
  let envelopeHost: string;
  let envelopeProjectId: string;
  try {
    const envelopeDsn = new URL(JSON.parse(headerLine).dsn);
    envelopeHost = envelopeDsn.hostname;
    envelopeProjectId = envelopeDsn.pathname.replace(/^\//, "");
  } catch {
    return new Response("Invalid envelope", { status: 400, headers: corsHeaders });
  }

  if (envelopeHost !== allowedHost || envelopeProjectId !== allowedProjectId) {
    return new Response("DSN mismatch", { status: 403, headers: corsHeaders });
  }

  const upstream = `https://${allowedHost}/api/${allowedProjectId}/envelope/`;
  try {
    const response = await fetch(upstream, { method: "POST", body: envelope });
    return new Response(null, { status: response.status, headers: corsHeaders });
  } catch (err) {
    console.error("Sentry tunnel upstream failed:", err);
    return new Response("Upstream failed", { status: 502, headers: corsHeaders });
  }
};
