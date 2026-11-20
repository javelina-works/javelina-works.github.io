/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  posthog?: {
    capture: (event: string, properties?: Record<string, unknown>) => void;
    captureException: (error: unknown) => void;
    identify: (
      distinctId: string,
      properties?: Record<string, unknown>,
    ) => void;
    reset: () => void;
    get_session_id?: () => string | null;
  };
}
