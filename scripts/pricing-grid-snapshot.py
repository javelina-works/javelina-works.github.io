"""Write src/data/pricing-grid.json from the ballpark quote engine.

The /pricing page fetches the live grid from the ballpark API and only falls
back to this snapshot when that request fails, so regenerate it whenever the
engine changes. Run with the brush-targeting backend's environment:

    ../brush-targeting/backend/.venv/bin/python scripts/pricing-grid-snapshot.py

Public-safe by design: costs leave only as three coarse buckets rounded to
5%, and days as a band index, so unit costs and field throughput can't be
backed out of the page.
"""

from __future__ import annotations

import datetime
import json
import pathlib

from quote_generation.engine import compute
from quote_generation.inputs import ChemicalInputs, FieldOpsInputs, QuoteInputs
from tasks_ballpark.worker.helpers.pricing import price_quote

ACRES = [25, 50, 100, 160, 250, 320, 500, 640, 1000, 1500, 2000, 3000, 5000]
COVER = list(range(1, 46))  # whole percent
DAY_BANDS = [
    (2, "1–2 days"),
    (5, "3–5 days"),
    (14, "1–2 weeks"),
    (28, "2–4 weeks"),
    (60, "1–2 months"),
    (90, "2–3 months"),
    (10**9, "3+ months"),
]
BUCKETS = {
    "treatment": ("Chemical", "Labor"),
    "travel": ("Travel + lodging", "Survey"),
    "contingency": ("Contingency",),
}


def day_band(days: int) -> int:
    return next(i for i, (top, _) in enumerate(DAY_BANDS) if days <= top)


def shares(lines: dict[str, float]) -> list[float]:
    amts = [sum(lines.get(k, 0.0) for k in ks) for ks in BUCKETS.values()]
    total = sum(amts) or 1.0
    return [round(a / total * 20) / 20 for a in amts]


def row(acres: int, pct: int) -> list[float]:
    q = price_quote(acres, pct / 100, None)
    res = compute(
        QuoteInputs(
            field_ops=FieldOpsInputs(
                chemical=ChemicalInputs(detected_targets=q.plants, acres=acres)
            )
        )
    )
    lines = {ln.label: ln.amount for ln in res.lines}
    mid = round(max(q.total, q.low) / 50) * 50
    return [q.low, q.high, mid, q.plants, day_band(q.days), *shares(lines)]


def main() -> None:
    out = {
        "as_of": datetime.date.today().isoformat(),
        "source": "snapshot",
        "acres": ACRES,
        "cover": COVER,
        "fields": ["low", "high", "mid", "plants", "day_band", *BUCKETS],
        "day_bands": [label for _, label in DAY_BANDS],
        "rows": [[row(a, c) for c in COVER] for a in ACRES],
    }
    path = pathlib.Path(__file__).resolve().parent.parent / "src/data/pricing-grid.json"
    path.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"wrote {path}")


if __name__ == "__main__":
    main()
