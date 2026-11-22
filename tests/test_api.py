"""ASGI integration tests. All draws use temporary stock, never real stock."""
import asyncio
import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
import kuji_service as service
from main import app


async def request(method, path, body=None):
    payload = json.dumps(body).encode() if body is not None else b""
    sent = []
    received = False

    async def receive():
        nonlocal received
        if not received:
            received = True
            return {"type": "http.request", "body": payload, "more_body": False}
        return {"type": "http.disconnect"}

    async def send(message):
        sent.append(message)

    await app({
        "type": "http", "asgi": {"version": "3.0"}, "http_version": "1.1",
        "method": method, "scheme": "http", "path": path,
        "raw_path": path.encode(), "query_string": b"", "root_path": "",
        "headers": [(b"content-type", b"application/json")],
        "server": ("test", 80), "client": ("127.0.0.1", 12345),
    }, receive, send)
    status = next(m["status"] for m in sent if m["type"] == "http.response.start")
    data = b"".join(m.get("body", b"") for m in sent if m["type"] == "http.response.body")
    return status, json.loads(data)


class ApiTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.original_file = service.STOCK_FILE
        self.original_lock = service.draw_lock
        self.data = json.loads((ROOT / "backend/stock.json").read_text(encoding="utf-8"))
        service.STOCK_FILE = Path(self.tmp.name) / "stock.json"
        service.draw_lock = asyncio.Lock()
        service.save_stock(self.data)
        self.product_id = "halloween-pouch"

    def tearDown(self):
        service.STOCK_FILE = self.original_file
        service.draw_lock = self.original_lock
        self.tmp.cleanup()

    async def test_list_normal(self):
        status, data = await request("GET", "/api/kuji")
        self.assertEqual(status, 200)
        self.assertEqual(len(data), 3)
        self.assertTrue(all(item["image"].startswith("/images/") for item in data))

    async def test_detail_normal(self):
        status, data = await request("GET", f"/api/kuji/{self.product_id}")
        self.assertEqual(status, 200)
        self.assertEqual(len(data["prizes"]), 3)
        self.assertEqual(sum(p["remaining"] for p in data["prizes"]), data["remainingStock"])

    async def test_detail_unknown(self):
        status, data = await request("GET", "/api/kuji/not-a-product")
        self.assertEqual(status, 404)
        self.assertIn("존재하지", data["detail"])

    async def test_draw_normal(self):
        before = len(self.data[self.product_id]["tickets"])
        status, data = await request("POST", "/api/draw", {"kujiId": self.product_id, "count": 1})
        self.assertEqual(status, 200)
        self.assertEqual(len(data["results"]), 1)
        self.assertTrue(data["results"][0]["image"])
        self.assertEqual(data["remainingStock"], before - 1)
        self.assertEqual(len(service.load_stock()[self.product_id]["tickets"]), before - 1)

    async def test_draw_unsupported_count_preserves_stock(self):
        status, _ = await request("POST", "/api/draw", {"kujiId": self.product_id, "count": 2})
        self.assertEqual(status, 409)
        self.assertEqual(service.load_stock(), self.data)

    async def test_draw_validation(self):
        for count in (0, 11):
            status, _ = await request("POST", "/api/draw", {"kujiId": self.product_id, "count": count})
            self.assertEqual(status, 422)
        self.assertEqual(service.load_stock(), self.data)

    async def test_draw_insufficient_and_sold_out(self):
        self.data[self.product_id]["tickets"] = self.data[self.product_id]["tickets"][:1]
        service.save_stock(self.data)
        status, _ = await request("POST", "/api/draw", {"kujiId": self.product_id, "count": 3})
        self.assertEqual(status, 409)
        self.assertEqual(service.load_stock(), self.data)
        self.data[self.product_id]["tickets"] = []
        service.save_stock(self.data)
        status, _ = await request("POST", "/api/draw", {"kujiId": self.product_id, "count": 1})
        self.assertEqual(status, 409)

    async def test_concurrent_draws_do_not_duplicate_tickets(self):
        self.data[self.product_id]["tickets"] = self.data[self.product_id]["tickets"][:3]
        service.save_stock(self.data)
        responses = await asyncio.gather(*[
            request("POST", "/api/draw", {"kujiId": self.product_id, "count": 1}) for _ in range(5)
        ])
        successful = [data for status, data in responses if status == 200]
        self.assertEqual(len(successful), 3)
        self.assertEqual(sum(status == 409 for status, _ in responses), 2)
        self.assertEqual(len({data["results"][0]["id"] for data in successful}), 3)
        self.assertEqual(service.load_stock()[self.product_id]["tickets"], [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
