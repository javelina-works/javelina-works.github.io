import * as Sentry from "@sentry/node";

let initialized = false;

export function ensureSentry(): typeof Sentry {
  if (!initialized) {
    if (process.env.PUBLIC_SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.PUBLIC_SENTRY_DSN,
        environment: process.env.CONTEXT ?? process.env.NODE_ENV ?? "development",
        tracesSampleRate: 0,
      });
    }
    initialized = true;
  }
  return Sentry;
}
