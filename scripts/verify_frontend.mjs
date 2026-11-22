// Test deployed logic and live API data; this is not a browser UI test.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { filterKujiList, buildRankOdds, getProbability } from "../js/catalog-utils.js";

const base = (process.argv[2] || "").replace(/\/$/u, "");
if (!base.startsWith("http")) throw new Error("Usage: node scripts/verify_frontend.mjs BASE_URL");
const get = async (path) => {
    const response = await fetch(base + path, { signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, path);
    return response;
};
const deployedCode = await (await get("/js/catalog-utils.js")).text();
const localCode = await readFile(new URL("../js/catalog-utils.js", import.meta.url), "utf8");
const hash = (text) => createHash("sha256").update(text.replace(/\r\n/gu, "\n")).digest("hex");
assert.equal(hash(deployedCode), hash(localCode), "deployed logic must match tested local code");
const products = await (await get("/api/kuji")).json();
const records = [];
const matches = filterKujiList(products, "인어섬");
assert.equal(matches.length, 1);
records.push({ feature: "search", input: "인어섬", result: matches.map((p) => p.id), passed: true });
const empty = filterKujiList(products, "없는상품");
assert.equal(empty.length, 0);
records.push({ feature: "search-boundary", input: "없는상품", result: empty, passed: true });
const images = new Set(products.map((p) => p.image));
for (const product of products) {
    const detail = await (await get(`/api/kuji/${product.id}`)).json();
    const odds = buildRankOdds(detail.prizes, detail.remainingStock);
    assert.equal(odds.reduce((sum, item) => sum + item.remaining, 0), detail.remainingStock);
    const sum = odds.reduce((sum, item) => sum + item.probability, 0);
    assert.ok(Math.abs(sum - (detail.remainingStock > 0 ? 100 : 0)) < 1e-10);
    records.push({ feature: "rank-odds", input: { product: product.id, remaining: detail.remainingStock },
                   result: odds, sum, passed: true });
    for (const prize of detail.prizes) images.add(prize.image);
}
assert.equal(getProbability(0, 0), 0);
assert.deepEqual(buildRankOdds([], 0), []);
records.push({ feature: "odds-boundary", input: { prizes: [], remaining: 0 },
               result: { probability: 0, ranks: [] }, passed: true });
for (const path of images) {
    const response = await fetch(base + path, { method: "HEAD", signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, path);
}
records.push({ feature: "deployed-images", result: { checked: images.size, status: 200 }, passed: true });
const output = new URL("../docs/evidence/deployment-logic.json", import.meta.url);
await mkdir(new URL(".", output), { recursive: true });
await writeFile(output, JSON.stringify({ executed_at_utc: new Date().toISOString(), executor: "Codex",
    base_url: base, method: "CLI logic checks using live API data and hash-verified deployed JavaScript; not browser UI",
    deployed_js_sha256: hash(deployedCode), records }, null, 2) + "\n");
console.log(`${records.length}/${records.length} deployed logic checks passed; ${images.size} images accessible`);
