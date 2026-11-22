"""Record real HTTP inputs/results. --draw performs exactly one demo draw."""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

parser = argparse.ArgumentParser()
parser.add_argument("base_url")
parser.add_argument("--output", default="docs/evidence/deployment-http.json")
parser.add_argument("--draw", action="store_true")
args = parser.parse_args()
base = args.base_url.rstrip("/")
records = []


def check(name, method, path, expected, payload=None):
    body = json.dumps(payload).encode() if payload is not None else None
    req = Request(base + path, data=body, method=method, headers={"Content-Type": "application/json"})
    try:
        with urlopen(req, timeout=30) as response:
            status, result = response.status, json.load(response)
    except HTTPError as error:
        status, result = error.code, json.load(error)
    records.append({"case": name, "method": method, "path": path, "input": payload,
                    "expected_status": expected, "status": status, "result": result,
                    "passed": status == expected})
    return result


check("health", "GET", "/api/health", 200)
products = check("list-normal", "GET", "/api/kuji", 200)
product_id = products[0]["id"]
check("detail-normal", "GET", f"/api/kuji/{product_id}", 200)
check("detail-unknown", "GET", "/api/kuji/not-a-product", 404)
before = check("stock-before-invalid-draw", "GET", f"/api/kuji/{product_id}", 200)
check("draw-invalid-count", "POST", "/api/draw", 409, {"kujiId": product_id, "count": 2})
check("draw-out-of-range", "POST", "/api/draw", 422, {"kujiId": product_id, "count": 11})
after = check("stock-after-invalid-draw", "GET", f"/api/kuji/{product_id}", 200)
records.append({"case": "invalid-draw-does-not-consume-stock", "before": before["remainingStock"],
                "after": after["remainingStock"], "passed": before["remainingStock"] == after["remainingStock"]})
if args.draw:
    result = check("draw-normal", "POST", "/api/draw", 200, {"kujiId": product_id, "count": 1})
    records[-1]["passed"] = records[-1]["passed"] and len(result.get("results", [])) == 1
    latest = check("stock-after-normal-draw", "GET", f"/api/kuji/{product_id}", 200)
    records.append({"case": "successful-draw-consumes-one", "before": after["remainingStock"],
                    "after": latest["remainingStock"],
                    "passed": latest["remainingStock"] == after["remainingStock"] - 1})
output = Path(args.output)
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps({"executed_at_utc": datetime.now(timezone.utc).isoformat(),
                              "base_url": base, "executor": "Codex agent or recorded CLI operator",
                              "records": records}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{sum(r['passed'] for r in records)}/{len(records)} checks passed; evidence: {output}")
raise SystemExit(0 if all(r["passed"] for r in records) else 1)
