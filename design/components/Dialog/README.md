# Dialog

A focused task or a player over the page: the home page's demo video, a confirmation. New for the site; derived from the system rules. It is a native `<dialog>` opened with `showModal()`, so focus is held inside it, the page behind is inert, and Escape closes it.

- **Card:** `surface`, a `line` edge, `radius-lg` (the system's radius for dialogs), `shadow-raise-on-band`. Up to 640px wide (`jw-dialog--media`: up to 960px), and never wider than the screen less 16px a side; it scrolls inside itself when taller than the screen.
- **Scrim** (`::backdrop`): shell (`shell-3`) at 78%, by day and at night. The page behind does not scroll while it is open.
- **Head:** the title in `heading-3` and a 44×44 close button on the right: an × drawn with two 2px bars in `text-muted`, `text` on a `surface-sunken` fill on hover, `shadow-focus` on focus. Named "Close".
- **Body:** 17px `text-body`. **Actions** (optional) under it: shell, burnt, ghost or quiet buttons. Never the glowing primary: the header lamp stays the page's one glowing action.
- **Media** (`jw-dialog--media`): the head holds only the close button, then a 16:9 frame on `shell-3` for the player. The title names the dialog for screen readers (`aria-label`).
- **Motion:** it fades in and rises 8px (opacity and transform, `duration-glow`); the scrim fades. Nothing moves under reduced motion.
- **Closing:** the close button, any element with `data-jw-dialog-close`, Escape (handled on the dialog and marked handled, so the nav bar's own Escape leaves it alone), or a press on the scrim. Focus returns to the opener.
- **Events:** `jw-dialog-open` (`detail.opener`) on open; the native `close` on close. The video uses them to build its player after the dialog paints and to remove it on close (which stops playback).

## Plain HTML
```html
<button type="button" class="jw-btn jw-btn--shell" data-jw-dialog-open="video-demo" aria-haspopup="dialog" aria-expanded="false">Watch the video</button>

<dialog id="video-demo" class="jw-dialog jw-dialog--media" aria-label="Video" data-jw-dialog>
  <div class="jw-dialog__head">
    <button type="button" class="jw-dialog__close" aria-label="Close" data-jw-dialog-close></button>
  </div>
  <div class="jw-dialog__frame"><!-- the player is built here after a press --></div>
</dialog>

<dialog id="confirm" class="jw-dialog" aria-labelledby="confirm-title" data-jw-dialog>
  <div class="jw-dialog__head"><h2 class="jw-dialog__title t-heading-3" id="confirm-title">…</h2><button type="button" class="jw-dialog__close" aria-label="Close" data-jw-dialog-close></button></div>
  <div class="jw-dialog__body"><p>…</p></div>
  <div class="jw-dialog__actions"><button type="button" class="jw-btn jw-btn--quiet" data-jw-dialog-close>Close</button></div>
</dialog>
```

## Astro
- `<Dialog id="…" title="…" [hideTitle] [size="md|media"] [closeLabel]>body<Fragment slot="actions">…</Fragment></Dialog>` from `src/layouts/components/jw/Dialog.astro`. Its script opens it from any `[data-jw-dialog-open="<id>"]` (a `<Button>` passes the attribute through).
- The video: `<VideoModal video={{ id, src, provider }} />` from `src/layouts/components/widgets/VideoModal.astro`. Nothing loads from YouTube until the press (privacy-enhanced youtube-nocookie.com).

## Rules
- Use a dialog only when the page must wait for an answer, or for a player. Everything else belongs on the page.
- Never open one on page load or on scroll.
