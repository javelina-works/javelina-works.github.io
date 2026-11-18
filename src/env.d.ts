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

// Preline ships each part as its own module, but types only for the
// auto-initialising build (dist/<part>.d.ts). The "-non-auto" builds export
// the same class, so borrow those types.
declare module "preline/plugins/dropdown-non-auto" {
  export { default } from "preline/plugins/dropdown";
}
declare module "preline/plugins/accordion-non-auto" {
  export { default } from "preline/plugins/accordion";
}
declare module "preline/plugins/overlay-non-auto" {
  export { default } from "preline/plugins/overlay";
}
declare module "preline/plugins/select-non-auto" {
  export { default } from "preline/plugins/select";
}
declare module "preline/plugins/tabs-non-auto" {
  export { default } from "preline/plugins/tabs";
}
declare module "preline/plugins/collapse-non-auto" {
  export { default } from "preline/plugins/collapse";
}
