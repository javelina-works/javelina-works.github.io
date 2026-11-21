# Ballpark partner embed

Partners can put the Ballpark brush-clearing estimate tool on their own site.
It runs in an iframe served from javelinaworks.com, so the address search,
parcel lookup, map, estimate API, and the Turnstile-protected contact form all
work exactly as on [/tools/ballpark/](https://javelinaworks.com/tools/ballpark/).

| Piece                                  | File                                                 |
| -------------------------------------- | ---------------------------------------------------- |
| Embed page (`/embed/ballpark/`)        | `src/pages/embed/ballpark.astro`                     |
| Chrome-free layout                     | `src/layouts/Embed.astro`                            |
| The tool (shared with the public page) | `src/layouts/components/ballpark/BallparkTool.astro` |
| Loader partners include                | `public/embed/ballpark.js`                           |
| Local end-to-end test page             | `public/embed/demo.html`                             |
| Framing + cache headers                | `netlify.toml` (`/*`, `/embed/*`)                    |
| Logo files in the footer               | `public/assets/logos/`                               |

## Partner snippet

```html
<div data-javelina-ballpark data-partner="brushbullet"></div>
<script src="https://javelinaworks.com/embed/ballpark.js" async></script>
<p>
  Brush estimate by
  <a href="https://javelinaworks.com/tools/ballpark/">Javelina Works</a>
</p>
```

The credit line is the only part search engines count as a link from the
partner's site to ours. Everything inside the iframe belongs to our own page,
which is `noindex, nofollow`. So:

- keep the line **outside** the div (the loader empties the div);
- a plain link with our name as its text, without `rel="nofollow"`;
- ask for it as a partner credit, not as a condition of using the tool. Google
  treats links traded for goods or services as paid links.

React sites can't use this snippet as is: see [React sites](#react-sites).

The loader swaps the div's contents for an iframe (`width: 100%`, no border,
`allow="geolocation"` for "I'm standing on it", `loading="lazy"`) and resizes
it to the tool's height as the visitor moves through it.

Optional attributes on the div:

| Attribute                       | Effect                                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `data-partner`                  | Attribution slug. Must match `^[a-z0-9-]{1,40}$`, else ignored.                                                   |
| `data-background="transparent"` | Page background shows through (default is white).                                                                 |
| `data-title`                    | iframe `title` for screen readers.                                                                                |
| `data-src-base`                 | Origin to load from, for testing (e.g. `https://staging--javelina-works.netlify.app` or `http://localhost:4321`). |

Without the loader, a fixed-height iframe of
`https://javelinaworks.com/embed/ballpark/?partner=<slug>` also works (it just
scrolls inside instead of growing).

## React sites

React never runs a `<script>` tag written inside a component, so on a React
site (Lovable, Next.js, Vite) the snippet above shows an empty box. Use this
component instead. It renders the box and the credit line as normal HTML, so
the link is in the page's HTML for search engines, and loads the loader once
in the browser. It copes with moving between pages and with React running
effects twice in development, and if the loader fails to download, the next
page that shows the box tries again. The `"use client"` line is for the
Next.js App Router; other React sites ignore it.

```tsx
"use client";
// Javelina Works brush-clearing estimate, for React sites.
// Usage: <JavelinaBallpark partner="your-slug" />
import { useEffect } from "react";

const LOADER_SRC = "https://javelinaworks.com/embed/ballpark.js";

declare global {
  interface Window {
    JavelinaBallpark?: { mount: () => void };
  }
}

export function JavelinaBallpark({ partner }: { partner: string }) {
  useEffect(() => {
    // The loader already ran (an earlier page of this app): fill this box.
    if (window.JavelinaBallpark) {
      window.JavelinaBallpark.mount();
      return;
    }
    // The loader is on its way (React runs effects twice in development);
    // it fills every box on the page when it arrives.
    if (document.querySelector(`script[src="${LOADER_SRC}"]`)) return;
    const script = document.createElement("script");
    script.src = LOADER_SRC;
    script.async = true;
    // A failed download leaves no tag behind, so the next box tries again.
    script.addEventListener("error", () => script.remove());
    document.body.appendChild(script);
  }, []);

  return (
    <div>
      <div data-javelina-ballpark data-partner={partner} />
      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        Brush estimate by{" "}
        <a
          href="https://javelinaworks.com/tools/ballpark/"
          style={{ textDecoration: "underline" }}
        >
          Javelina Works
        </a>
      </p>
    </div>
  );
}

export default JavelinaBallpark;
```

On a Lovable site, the partner can paste the component above with this
prompt (Brush Bullet's slug filled in):

> Create `src/components/JavelinaBallpark.tsx` with exactly the code below,
> unchanged. Render `<JavelinaBallpark partner="brushbullet" />` on the
> calculator page in place of the current calculator, inside the page's
> normal content container. Keep the "Javelina Works" credit a plain link,
> without nofollow.

## Credit inside the embed

The embed ends with a footer: our logo (javelina mark and wordmark, linking
to javelinaworks.com with `utm_source=<slug>`) and, for a known partner,
"Provided in partnership with <Partner>". Known partners are the `PARTNERS`
map in `src/pages/embed/ballpark.astro` (slug to display name); any other
slug gets the logo alone. The logo files are rust and ink, made for light
backgrounds, so `data-background="transparent"` suits light partner pages
only.

## The `partner` parameter

`/embed/ballpark/?partner=<slug>` (validated against the same regex) is:

- added as a `partner` property to every `track()` event, and registered as a
  PostHog super property (`partner`, `embed: true`) so `$pageview` carries it;
- sent as `partner` in the `POST /api/ballpark` trigger body;
- sent as `partner` in the `POST /api/ballpark/{run_id}/contact` body
  (`channel` stays `"marketing"`).

Both request fields are sent **only when a valid slug is present**: the public
page never reads `?partner=`, so its requests are unchanged and stay
compatible with a backend that rejects unknown fields.

The "Estimate powered by Javelina Works" link also gets `utm_source=<slug>`.

## postMessage events

The embed posts these to `window.parent` (no PII). The loader only accepts
them from its own iframe at the iframe's origin, and re-dispatches each as a
bubbling DOM `CustomEvent` of the same name on the container div
(`event.detail` is the message).

| `type`                       | Payload                                                               | When                                                                      |
| ---------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `javelina-ballpark:ready`    | none                                                                  | page `load`                                                               |
| `javelina-ballpark:height`   | `height` (CSS px)                                                     | on load and whenever the content height changes (ResizeObserver)          |
| `javelina-ballpark:estimate` | `status` (`"succeeded"` / `"failed"`), `acres`, `low`, `high`, `demo` | an estimate finishes (the Fox Canyon demo included, flagged `demo: true`) |

```js
document
  .querySelector("[data-javelina-ballpark]")
  .addEventListener("javelina-ballpark:estimate", (e) => {
    console.log(e.detail.status, e.detail.low, e.detail.high);
  });
```

## Adding a partner

1. Add the partner's origins to the `frame-ancestors` list on `/embed/*` in
   `netlify.toml`, e.g.
   `frame-ancestors 'self' https://brushbullet.com https://*.brushbullet.com https://newpartner.com http://localhost:*`.
   Browsers refuse to render the iframe on any origin not listed. Keep the
   header to `frame-ancestors` only, so it can never block scripts or APIs.
   Every other page sends `X-Frame-Options: SAMEORIGIN` (the `/*` rule), which
   browsers ignore where `frame-ancestors` is present, so only `/embed/*` can
   be framed by partners.
2. Add their slug and display name to `PARTNERS` in
   `src/pages/embed/ballpark.astro`, for the footer's partnership line.
3. Give them the snippet (or the React component) with their slug.
4. If Turnstile ever starts failing in the embed, check the widget's hostname
   list in Cloudflare: it validates the iframe's host (javelinaworks.com), not
   the partner's.

## Analytics in the embed

On javelinaworks.com, analytics and session replay run from page load unless
the visitor turns them off in the cookie banner; visitors who need prior
consent (a Global Privacy Control signal, or a UK / EU / EEA time zone) start
off until they accept. A banner can't be shown inside a partner's page, and a
choice made on javelinaworks.com doesn't reach a (storage-partitioned)
third-party iframe. So the embed initializes PostHog with
`persistence: "memory"`: nothing is written to cookies or localStorage, the
anonymous id lasts only for that page view, and session replay and surveys are
off. Events are captured without a banner on that basis, and visitors who
need prior consent get no PostHog in the embed at all. If that is not
acceptable, drop `<PostHog embed />` from `src/layouts/Embed.astro`.

## Testing locally

`pnpm dev`, then open http://localhost:4321/embed/demo.html. It loads the
iframe from its own origin through the loader and logs every message. Add
`?base=<origin>` to point it at another deployment. The dev server and deploy
previews talk to the staging estimate API; only javelinaworks.com uses
production.

## Known limits

- Inside an auto-height iframe the tool can't scroll the partner's page, so
  the mobile "scroll the result into view" nudges do nothing.
- The map's full-screen button fills the iframe, not the partner's window.
