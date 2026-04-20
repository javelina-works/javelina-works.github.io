# Astro known issues & workarounds

Active upstream issues we've pinned around. Each entry documents the symptom,
root cause, the workaround in this repo, how to reproduce locally, and what to
watch for before unpinning.

---

## Astro 6.1.3+ `plugin-chunk-imports` corrupts dynamic `import()` on Netlify

**First hit:** 2026-04-19 — Netlify deploy of commit `54583a6` failed.
**Pinned around:** commit `d117ef9` (PR #12).
**Fixed upstream:** `astro@6.1.8` (2026-04-18) — see "Upstream resolution" below.
**Status:** Historical. Unpin tracked in a follow-up PR; this section is kept
for future-proofing future regressions in the same code path.

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
- First proposed fix: [withastro/astro#16207](https://github.com/withastro/astro/pull/16207)
  — closed by a maintainer in favor of the two PRs below.

### Upstream resolution

Two PRs shipped together in [`astro@6.1.8`](https://github.com/withastro/astro/releases/tag/astro%406.1.8)
(2026-04-18):

1. **[#16282](https://github.com/withastro/astro/pull/16282)** by @jmurty —
   root-cause fix. Corrects the offset math in `plugin-chunk-imports.ts` so
   the query string is appended to dynamic `import()` specifiers correctly
   instead of being spliced into the middle.
2. **[#16367](https://github.com/withastro/astro/pull/16367)** by @ematipico
   — defense in depth. A new `cleanChunkName()` replaces chars outside
   `[\w.\-/]` in chunk names so that any leftover garbage from Vite module
   IDs can't re-introduce a Netlify deploy break.

The canonical place to find upstream fixes is the Astro
[releases page](https://github.com/withastro/astro/releases), not any single
issue or PR — for this bug the issue thread (#16209) was closed without a
useful resolution pointer, and the first PR that fixed it (#16207) was
closed in favor of others. **Always cross-check the changelog of a recent
release before assuming "no fix yet."**

### What we did — then and now

**Emergency pin (PR #12, 2026-04-19):** rolled back to the last known-good
release.

| Package             | `^6.1.7` era | Pinned  | Reason                                |
|---------------------|--------------|---------|---------------------------------------|
| `astro`             | `^6.1.7`     | `6.1.2` | Regression introduced in `6.1.3`.     |
| `@astrojs/netlify`  | `^7.0.7`     | `7.0.6` | `7.0.7` imports `verifyOptions` from astro internals — a symbol added after `6.1.2`. |

The pins were exact (no caret) so `pnpm install` on Netlify couldn't silently
drift back into the broken range. `pnpm-lock.yaml` is gitignored in this
repo, so the pin lived in `package.json`.

**Unpin (follow-up PR):** once `astro@6.1.8` was confirmed to include both
#16282 and #16367, ranges were restored to `^6.1.8` and `^7.0.7`.

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

### Verifying an unpin (checklist)

Reusable any time a patched `astro` / `@astrojs/netlify` bump needs to clear
this class of bug before merging:

1. Bump `astro` and `@astrojs/netlify` together — the adapter's internal
   imports must match astro's API surface (see the `7.0.7` / `verifyOptions`
   note above).
2. Run `DEPLOY_ID=local-test pnpm build`. The build must succeed and the
   output must not contain any `_astro/*.!~{…}~.js` filenames.
3. Grep the client chunks for well-formed dynamic imports:
   ```sh
   grep -oE 'import\("\./[^"]+"' dist/_astro/*.js | head
   ```
   Valid output: `import("./plyr.<hash>.js?dpl=local-test"`. Invalid output
   has a `?` outside the quotes or mid-specifier — that's the regression
   re-appearing.
4. Open a deploy preview PR. Netlify's build is the authoritative check:
   `DEPLOY_ID` is always set there, and any residual chunk-path issue on
   Linux will surface that local macOS/Windows builds miss.

### Future mitigations

- **CI simulation.** Add a GitHub Actions step that runs
  `DEPLOY_ID=ci pnpm build` on PRs so this class of regression can't reach
  Netlify again without warning. Cheap, catches future upstream
  reintroductions of the same class of bug. (See TODO.md.)
- **Avoid dynamic `import()` in client `<script>` tags.** Converting
  `VideoModal.astro` to a top-level `import Plyr from "plyr"` would sidestep
  the rewrite entirely, at the cost of Plyr's lazy-load benefit. Not worth
  doing proactively, but it's the escape hatch if the bug class re-emerges
  and upstream is slow.
- **`pnpm patch`.** If a future regression blocks us again but upstream
  hasn't cut a release, apply the candidate fix via
  `pnpm patch astro@<version>` and commit the generated patch under
  `patches/`. Lower overhead than forking.
