import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { filterKujiList, buildRankOdds, getProbability } from "../js/catalog-utils.js";

const items = [
    { title: "인어섬의 비밀 봉제인형", remainingStock: 63 },
    { title: "해피 드라이브 시리즈", remainingStock: 23 },
    { title: "할로윈 마스코트 동전 파우치", remainingStock: 0 }
];

test("search accepts separated keywords, extra spaces and normalized Korean", () => {
    assert.deepEqual(filterKujiList(items, "  봉제  인어섬 "), [items[0]]);
    assert.deepEqual(filterKujiList(items, "해피드라이브"), [items[1]]);
    assert.deepEqual(filterKujiList(items, "인어섬".normalize("NFD")), [items[0]]);
    assert.deepEqual(filterKujiList(items, "  "), items);
});

test("status filters combine with the query and support no matches", () => {
    assert.deepEqual(filterKujiList(items, "", "available"), items.slice(0, 2));
    assert.deepEqual(filterKujiList(items, "파우치", "sold-out"), [items[2]]);
    assert.deepEqual(filterKujiList(items, "파우치", "available"), []);
    assert.deepEqual(filterKujiList(items, "없는상품"), []);
});

test("rank odds combine characters in the same rank", () => {
    assert.deepEqual(buildRankOdds([
        { rank: "C", remaining: 10 },
        { rank: "A", remaining: 1 },
        { rank: "C", remaining: 9 }
    ], 20), [
        { rank: "A", remaining: 1, probability: 5 },
        { rank: "C", remaining: 19, probability: 95 }
    ]);
    assert.equal(getProbability(9, 20), 45);
});

test("sold-out products never produce NaN or infinity", () => {
    assert.deepEqual(buildRankOdds([], 0), []);
    assert.equal(getProbability(0, 0), 0);
});

test("real catalog rank odds sum to 100% and use remaining tickets", () => {
    const stock = JSON.parse(readFileSync(new URL("../backend/stock.json", import.meta.url), "utf8"));
    for (const product of Object.values(stock)) {
        const odds = buildRankOdds(product.tickets.map((ticket) => ({ ...ticket, remaining: 1 })), product.tickets.length);
        assert.equal(odds.reduce((sum, item) => sum + item.remaining, 0), product.tickets.length);
        assert.ok(Math.abs(odds.reduce((sum, item) => sum + item.probability, 0) - 100) < 1e-10);
    }
});
