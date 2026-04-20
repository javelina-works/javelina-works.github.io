# Astro known issues & workarounds

Active upstream issues we've pinned around. Each entry documents the symptom,
root cause, the workaround in this repo, how to reproduce locally, and what to
watch for before unpinning.

---

## Astro 6.1.3+ `plugin-chunk-imports` corrupts dynamic `import()` on Netlify

**First hit:** 2026-04-19 — Netlify deploy of commit `54583a6` failed.
**Status:** Pinned around in commit `d117ef9` (PR #12). Waiting on upstream fix.

### Symptom

Netlify build fails at the client bundle step with an esbuild syntax error
that references an unresolved Rollup hash placeholder in the filename:

```
[ERROR] [vite] ✗ Build failed in 3.38s
Syntax error "d"
  Location:
    _astro/VideoModal.astro_astro_type_script_index_0_lang.!~{00h}~.js:33:135
```

The `!~{NNN}~` segment is Rollup's internal placeholder for the chunk's
content hash — it's still unresolved at error time because the failure fires
during the `renderChunk` phase, before hashes are computed. The character
after `Syntax error` (`"d"`, `"c"`, etc.) varies with the specific corrupted
byte and isn't meaningful on its own.

`pnpm build` succeeds locally. Only Netlify (and Vercel) reproduce it.

### Root cause

Astro 6.1.3 merged [PR #16110](https://github.com/withastro/astro/pull/16110),
which added `plugin-chunk-imports.ts`. During Rollup's `renderChunk` phase this
plugin walks every relative JS import in client chunks and appends an adapter-
supplied query string (e.g. `./shared.js` → `./shared.js?dpl=<DEPLOY_ID>`) to
support skew protection. The offset math is wrong for **dynamic** imports
(`await import("…")`), so the `?` lands inside the specifier and corrupts the
JS. Esbuild's later minify pass fails to parse it.

Two environmental conditions must both hold for the bug to fire:

1. The adapter configures `assetQueryParams`. `@astrojs/netlify` does this
   when `process.env.DEPLOY_ID` is set
   (`@astrojs/netlify/dist/index.js:494`).
2. The chunk being rewritten contains a dynamic `import()` with a relative
   specifier.

`DEPLOY_ID` is always set on Netlify CI and never set locally — which is why
local builds don't reveal the bug.

**In this repo the trigger is `VideoModal.astro`**, which lazy-loads Plyr:

```astro
<script>
  const { default: Plyr } = await import("plyr");
  await import("plyr/dist/plyr.css");
</script>
```

Upstream tracking:
- Issue: [withastro/astro#16209](https://github.com/withastro/astro/issues/16209)
  (closed as "use the issue template")
- Related issue: [withastro/astro#16196](https://github.com/withastro/astro/issues/16196)
- Proposed fix: [withastro/astro#16207](https://github.com/withastro/astro/pull/16207)
  (currently closed, not merged)

### What we did

Pinned to the last known-good release:

| Package             | Before    | After   | Reason                                |
|---------------------|-----------|---------|---------------------------------------|
| `astro`             | `^6.1.7`  | `6.1.2` | Regression introduced in `6.1.3`.     |
| `@astrojs/netlify`  | `^7.0.7`  | `7.0.6` | `7.0.7` imports `verifyOptions` from astro internals — a symbol added after `6.1.2`. |

The pins are exact (no caret) so `pnpm install` on Netlify can't silently
drift back into the broken range. `pnpm-lock.yaml` is gitignored in this
repo, so the pin lives in `package.json`.

### Reproducing locally

The bug only fires when `DEPLOY_ID` is set. To simulate a Netlify build:

```sh
DEPLOY_ID=local-test pnpm build
```

Any non-empty value works — it just needs to flip `assetQueryParams` on in
the adapter. Use this when:

- Deciding whether a newer astro release is safe to unpin (see below).
- Adding or changing client `<script>` code that uses dynamic `import()`.
- Auditing a new Astro/Netlify-adapter upgrade.

### Unpinning — what to verify first

When a fix ships upstream (watch [#16207](https://github.com/withastro/astro/pull/16207)
or the astro changelog for a note referencing `plugin-chunk-imports` /
`assetQueryParams`):

1. Bump both pins together — the adapter version must match astro's API surface.
2. Run `DEPLOY_ID=local-test pnpm build` locally and confirm no
   `_astro/*.!~{…}~.js` errors.
3. Grep the dist output for malformed import specifiers:
   ```sh
   grep -rE 'from "[^"]*\?dpl=[^"]*"[^)]' dist/_astro/ | head
   ```
   Valid rewrites look like `from "./shared.hash.js?dpl=…"`. Anything with a
   `?` inside the quotes in an unexpected position is still corrupted.
4. Open a deploy preview PR. The Netlify build is the authoritative check.

### Future mitigations to consider

- **CI simulation.** Add a GitHub Actions step that runs
  `DEPLOY_ID=ci pnpm build` on PRs so this regression can't reach Netlify
  again without warning. Cheap, catches future upstream reintroductions of
  the same class of bug. (See TODO.md.)
- **Avoid dynamic `import()` in client `<script>` tags.** Converting
  `VideoModal.astro` to a top-level `import Plyr from "plyr"` would sidestep
  the rewrite entirely, at the cost of Plyr's lazy-load benefit. Not worth
  doing proactively, but it's the escape hatch if the upstream fix takes a
  long time or the bug re-emerges.
- **`pnpm patch`.** If the upstream PR stalls and we need a post-6.1.2
  feature, apply PR #16207's diff via `pnpm patch astro@<version>` and
  commit the generated patch under `patches/`. Lower overhead than forking.
