# Automation

How dependency updates, CI gating, and the scheduled review agent fit together.

## Dependabot + auto-merge

`dependabot.yml` opens grouped PRs weekly:

- `astro` group — `astro`, `@astrojs/*`, `astro-auto-import`
- `prod-minor-patch` — production deps, minor + patch
- `dev-minor-patch` — dev deps, minor + patch
- `actions` — all GitHub Actions

`.github/workflows/dependabot-auto-merge.yml` enables `--auto --squash` on
**any non-major dependabot PR**. Major bumps (npm or GHA) require manual
review. The merge only fires once the required status checks on `main`
pass — see below.

## Required checks (protect-main ruleset)

The `protect-main` ruleset on `main`
(<https://github.com/javelina-works/javelina-works.github.io/rules/15309283>)
gates all merges. Currently required:

- `netlify/javelina-works/deploy-preview` — Netlify deploy preview must succeed
- `Validate` — CI job (astro-check + build) must succeed

Pending promotion (see scheduled agent below):

- `Playwright smoke (preview)` — added to the workflow but not yet required;
  soaking on PRs until proven stable

## Playwright smoke

`.github/workflows/playwright-preview.yml` runs `tests/e2e/smoke.spec.ts`
(home / blog index / one blog post) against the Netlify deploy preview URL,
triggered by the `deployment_status` event. Posts a sticky comment and
uploads the report as an artifact.

- Run locally against a built preview: `PREVIEW_URL=https://... pnpm test:e2e`
- Open Playwright UI: `pnpm test:e2e:ui`

## Scheduled review agent

A one-shot remote agent reviews the Playwright soak and promotes it to a
required check if it has been stable.

| Field | Value |
|---|---|
| Routine ID | `trig_01Dt5cDNETG57dR916dvAJMx` |
| Fires | `2026-05-11T15:00:00Z` (10:00 AM Mon May 11, America/Chicago) |
| Manage | <https://claude.ai/code/routines/trig_01Dt5cDNETG57dR916dvAJMx> |

### What it does

1. Pulls the last 10 runs of `playwright-preview.yml` and computes the
   non-skipped success rate.
2. **If ≥ 3 runs and ≥ 90% pass rate**: PATCHes the `protect-main` ruleset
   to add `Playwright smoke (preview)` to the required-checks list.
3. **If the PATCH fails (admin scope missing)**: opens a GitHub issue with
   the manual UI steps.
4. **If soak is insufficient**: opens an issue with the failing runs and
   recommends re-checking in ~2 weeks.

The agent always reports back via a GitHub issue (and a comment on PR #35
if still open). No silent runs.

### If the agent opens a "soak insufficient" issue

Either traffic to the repo has been low (not enough PRs to generate runs)
or Playwright is flaking on real changes. Check the failing runs in the
issue. Common fixes:

- A selector in `tests/e2e/smoke.spec.ts` is too tight — broaden it.
- A page route changed (e.g., `/blog/post-1/` no longer exists) — update
  the test target.
- Console-error noise from a third-party script — filter it in the test's
  `trackBrowserErrors` helper.

After fixing, re-arm the agent for another 2-week soak: open the routine
URL above, set a new `run_once_at`, and re-enable.

## Stale sweep

`.github/workflows/stale.yml` runs daily. Marks issues/PRs stale at 30d of
inactivity, closes at 60d. Exempts `pinned`, `security`, `keep`. PRs with
the `dependencies` label are also exempt so the dependabot backlog is not
auto-closed.

## Lockfile refresh

`.github/workflows/lockfile-refresh.yml` runs on the 1st of each month.
Executes `pnpm install --lockfile-only` and `pnpm dedupe`, opens a PR
titled `chore: monthly lockfile refresh` if `pnpm-lock.yaml` changes. This
catches transitive drift and dedupe opportunities that dependabot's
direct-dep grouped flow does not surface.

## Sentry

Sourcemap upload is wired in `astro.config.mjs` via `@sentry/astro`. It
runs during the Netlify production build and silently skips if the
following Netlify env vars are missing:

- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

Verify in **Netlify → Site config → Environment variables**.
