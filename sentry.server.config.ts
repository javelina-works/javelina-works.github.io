import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: process.env.PUBLIC_SENTRY_DSN,
  environment: process.env.CONTEXT ?? process.env.NODE_ENV ?? "development",
  tracesSampleRate: 0,
});
