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
| Framing + cache headers                | `netlify.toml` (`/embed/*`)                          |

## Partner snippet

```html
<div data-javelina-ballpark data-partner="brushbullet"></div>
<script src="https://javelinaworks.com/embed/ballpark.js" async></script>
```

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
2. Give them the snippet with their slug in `data-partner`.
3. If Turnstile ever starts failing in the embed, check the widget's hostname
   list in Cloudflare: it validates the iframe's host (javelinaworks.com), not
   the partner's.

## Analytics in the embed

The site's consent model keeps PostHog opted out until the cookie banner is
accepted. A banner can't be shown inside a partner's page, and consent given on
javelinaworks.com doesn't reach a (storage-partitioned) third-party iframe. So
the embed initializes PostHog with `persistence: "memory"`: nothing is written
to cookies or localStorage, the anonymous id lasts only for that page view,
and session replay and surveys are off. Events are captured without a banner
on that basis. If that is not acceptable, drop `<PostHog embed />` from
`src/layouts/Embed.astro`.

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
