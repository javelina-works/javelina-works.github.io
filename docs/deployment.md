# Deployment

The site is deployed to **GitHub Pages** automatically via a GitHub Actions
workflow whenever commits land on `main`.

## Workflow

The workflow lives at [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

**Triggers**

- Push to `main`
- Manual run via the Actions tab (`workflow_dispatch`)

**Pipeline**

1. **Build job** — checkout → set up Node 22 (with npm cache) → `npm install`
   → `npm run build` → upload `./dist` as a Pages artifact.
2. **Deploy job** — publishes the uploaded artifact to the `github-pages`
   environment via `actions/deploy-pages`.

A `pages` concurrency group prevents overlapping deploys from clobbering each
other; in-flight runs are not cancelled, so every commit on `main` is deployed
in order.

## One-time repo setup

1. **Settings → Pages → Build and deployment → Source**: set to
   **GitHub Actions**.
2. **Custom domain** (if using `javelinaworks.com`):
   - Add the domain under Settings → Pages.
   - Add a `public/CNAME` file containing `javelinaworks.com` so the file
     survives every build.
   - Confirm `site` in `astro.config.mjs` matches the canonical URL
     (currently `http://javelinaworks.com` — should likely be
     `https://javelinaworks.com`).
3. Confirm the `github-pages` environment exists (GitHub creates it on first
   deploy).

## Manual deploy

From the Actions tab, select **Deploy site to GitHub Pages** → **Run
workflow** → choose the branch.

## Rolling back

GitHub Pages only serves the most recent successful deployment. To roll back:

- Revert the offending commit on `main` and let the workflow redeploy, **or**
- Re-run the last known-good workflow run from the Actions tab.

## Secrets / environment

The workflow uses only the built-in `GITHUB_TOKEN` and OIDC (`id-token: write`)
for Pages — no additional secrets are required.

## Other deploy targets (legacy)

The repo still contains config files for other hosts — they are not currently
wired up to CI:

- `netlify.toml`
- `vercel.json` / `vercel.sh`
- `wrangler.toml` (Cloudflare)

If GitHub Pages becomes the only target long-term, these can be removed.
