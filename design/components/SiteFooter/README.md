# SiteFooter

The foot of every page: the brand, a line about the company and the newsletter sign-up; three link columns (Services, Tools, Company); the contact details; and the **footer line** on a shell plate with the status light, the copyright and the legal links. New for the site; the footer line follows the night-lamp prototype's `.legal` plate.

- On the page ground (`bg`) under a `line` rule. Text is 16px `text-body`; column titles are mono labels in `label` (`jw-footer__title`), the contact details' names are mono labels in `text-muted`.
- Every link is at least 44px tall. Links are `text-body`, `text` with an underline on hover, `land` for the current page, `shadow-focus` on focus.
- Layout: one column on phones (the link columns two up); from 641px the brand and contact side by side over the three link columns; from 1024px one row of brand, links and contact.
- The footer line is a shell plate (the shell sheen, `shell-edge`, `radius-md`, grain), dark by day and at night, with `on-shell` text and underlined `on-shell` links. The StatusLight rides on it without its own plate. The status light is the page's one green light; it blinks only while near the screen, and not at all with reduced motion.

## Plain HTML
```html
<footer class="jw-footer">
  <div class="jw-container">
    <div class="jw-footer__grid">
      <div class="jw-footer__brand">
        <a class="jw-footer__home" href="/">…logos (jw-logo--light / jw-logo--dark)…</a>
        <p class="jw-footer__about">…</p>
        <form class="jw-subscribe">…</form>
      </div>
      <nav class="jw-footer__nav" aria-label="Footer">
        <div class="jw-footer__col">
          <h2 class="jw-footer__title">Services</h2>
          <ul class="jw-footer__links"><li><a class="jw-footer__link" href="/services/brush-targeting/">Brush targeting</a></li>…</ul>
        </div>
        …
      </nav>
      <div class="jw-footer__col jw-footer__contact">
        <h2 class="jw-footer__title">Contact</h2>
        <dl class="jw-footer__details"><div><dt>Location</dt><dd>03 Ranch Road, Fort Davis, Texas</dd></div>…</dl>
        <ul class="jw-footer__links jw-footer__social">…</ul>
      </div>
    </div>
    <div class="jw-footer__line">
      <span class="jw-status"><span class="jw-pilot jw-pilot--status" aria-hidden="true" data-jw-light="status" data-jw-blink></span><span class="jw-status__label">Taking new surveys</span></span>
      <div class="jw-footer__legal">
        <p class="jw-footer__copy">Copyright © 2026 Javelina Works, Inc. All rights reserved.</p>
        <ul class="jw-footer__legal-links"><li><a href="/privacy-policy/">Privacy Policy</a></li>…<li><button type="button" id="cookie-preferences-link">Cookie preferences</button></li></ul>
      </div>
    </div>
  </div>
</footer>
```
Newsletter: `form.jw-subscribe` holds a `jw-footer__title`, a `jw-subscribe__row` (a Field with `jw-subscribe__field`, and a shell Button), a Checkbox, and `jw-subscribe__msg` / `jw-subscribe__msg--error` messages.

On the site: `src/layouts/components/global/Footer.astro` (links from `src/config/siteNav.ts`, contact details from `src/i18n/en.json`).

## Rules
- The street address is deliberately without a house number. Never complete it.
- Emails are plain `mailto:` links (Cloudflare obfuscates them in production; no script may read them).
- One status light a page, and only here. Text never sits on a wall: if the footer ever follows a wall directly, it keeps its own ground.
