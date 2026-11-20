/**
 * Form helpers for the contact form (src/layouts/components/widgets/ContactForm.astro), small enough to ship to the
 * browser: no Preline, no Markdown renderer. The messages a visitor sees are rendered into the page at build time; the
 * script only shows and hides them.
 *
 * Validation works on "checks": an element marked [data-jw-check] (a field, a radio fieldset or a checkbox row) that holds
 * one or more controls, an error span (.jw-field__error or [data-jw-check-error], with an id) and the words to show in
 * data-error. A check passes when
 * every control in it is valid (required, type="email"…), using the browser's own validity rules.
 *
 * Sending: submitForm() posts the form to the configured provider and resolves when the provider accepted it, or throws.
 *   netlify       urlencoded POST to the action ("/"), as Netlify Forms expects (the body carries form-name).
 *   formsubmit.co JSON POST to the action's /ajax/ address.
 *   formspree     JSON POST to the action.
 */

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const controlsIn = (check: HTMLElement): Control[] =>
  Array.from(check.querySelectorAll<Control>("input, select, textarea")).filter(
    (el) => !(el instanceof HTMLInputElement && el.type === "hidden"),
  );

/** The checks (fields, groups, checkbox rows) inside a form, in page order. */
export const formChecks = (form: HTMLFormElement): HTMLElement[] =>
  Array.from(form.querySelectorAll<HTMLElement>("[data-jw-check]"));

/** Whether every control in a check is valid. */
export const checkPasses = (check: HTMLElement): boolean =>
  controlsIn(check).every((el) => el.validity.valid);

/** Show or clear a check's error words, and point the controls at them for screen readers. */
export const setCheckError = (check: HTMLElement, on: boolean) => {
  const err = check.querySelector<HTMLElement>("[data-jw-check-error], .jw-field__error");
  if (!err) return;
  if (on) err.textContent = check.dataset.error || "";
  err.hidden = !on;
  check.classList.toggle("jw-field--error", on);
  const describe = check.tagName === "FIELDSET" ? [check] : controlsIn(check);
  for (const el of controlsIn(check)) {
    if (on) el.setAttribute("aria-invalid", "true");
    else el.removeAttribute("aria-invalid");
  }
  for (const el of describe) {
    const ids = (el.getAttribute("aria-describedby") || "").split(/\s+/).filter((id) => id && id !== err.id);
    if (on) ids.push(err.id);
    if (ids.length) el.setAttribute("aria-describedby", ids.join(" "));
    else el.removeAttribute("aria-describedby");
  }
};

/** Check every field, show the errors, and return the first control that needs fixing (or null when all pass). */
export const validateForm = (form: HTMLFormElement): Control | null => {
  let first: Control | null = null;
  for (const check of formChecks(form)) {
    const ok = checkPasses(check);
    setCheckError(check, !ok);
    if (!ok && !first) first = controlsIn(check).find((el) => !el.validity.valid) || controlsIn(check)[0] || null;
  }
  return first;
};

/** Clear every error and reset the controls to their starting values. */
export const formReset = (form: HTMLFormElement) => {
  form.reset();
  for (const check of formChecks(form)) setCheckError(check, false);
};

const postWithTimeout = async (url: string, init: RequestInit, timeout: number) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const fieldsAsObject = (form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries());

/** Send the form to its provider. Resolves when the provider accepted it; throws otherwise. */
export const submitForm = async (
  form: HTMLFormElement,
  provider: string,
  action: string,
  timeout = 30000,
): Promise<void> => {
  switch (provider) {
    case "netlify": {
      const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
      const response = await postWithTimeout(
        action || "/",
        { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body },
        timeout,
      );
      if (!response.ok) throw new Error("Netlify form submission failed.");
      return;
    }
    case "formsubmit.co": {
      const response = await postWithTimeout(
        action.replace("formsubmit.co/", "formsubmit.co/ajax/"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(fieldsAsObject(form)),
        },
        timeout,
      );
      const json = await response.json().catch(() => ({}));
      if (String(json.success) !== "true") throw new Error(json.message || "Form submission failed.");
      return;
    }
    case "formspree": {
      const response = await postWithTimeout(
        action,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(fieldsAsObject(form)),
        },
        timeout,
      );
      if (!response.ok) throw new Error("Request failed with status code " + response.status);
      return;
    }
    default:
      throw new Error("Unknown form provider.");
  }
};
