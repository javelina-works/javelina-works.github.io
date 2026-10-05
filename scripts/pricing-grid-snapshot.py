"""Refresh src/data/pricing-grid.json from the ballpark API's pricing grid.

The /pricing page fetches the live grid itself and only falls back to this
snapshot when that request fails, so refresh it whenever the engine changes:

    python3 scripts/pricing-grid-snapshot.py            # staging
    python3 scripts/pricing-grid-snapshot.py --prod     # production

The grid is built by brush-targeting's tasks_ballpark.pricing_grid (the same
engine as a live ballpark) and is public-safe by design: costs only as three
coarse buckets, days only as a band index.
"""

from __future__ import annotations

import json
import pathlib
import sys
import urllib.request

URLS = {
    "staging": "https://fastapi-staging.up.railway.app/api/v2/ballpark/pricing-grid",
    "prod": "https://brush-targeting-production.up.railway.app/api/v2/ballpark/pricing-grid",
}
REQUIRED = ("as_of", "acres", "cover", "fields", "day_bands", "rows")


def main() -> None:
    url = URLS["prod" if "--prod" in sys.argv else "staging"]
    with urllib.request.urlopen(url, timeout=60) as res:
        grid = json.load(res)
    missing = [k for k in REQUIRED if not grid.get(k)]
    if missing:
        sys.exit(f"{url} returned a grid without {', '.join(missing)}")
    grid["source"] = "snapshot"
    path = pathlib.Path(__file__).resolve().parent.parent / "src/data/pricing-grid.json"
    path.write_text(json.dumps(grid, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"wrote {path} (engine {grid.get('engine_version', '?')}, as of {grid['as_of']})")


if __name__ == "__main__":
    main()
