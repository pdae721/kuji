const normalize = (value) => value.normalize("NFKC").toLocaleLowerCase("ko-KR").replace(/\s+/gu, "");

export function filterKujiList(items, query = "", status = "all") {
    const terms = query.trim().split(/\s+/u).filter(Boolean).map(normalize);
    return items.filter((item) => {
        const title = normalize(item.title);
        const matchesStatus = status === "all"
            || (status === "available" && item.remainingStock > 0)
            || (status === "sold-out" && item.remainingStock === 0);
        return matchesStatus && terms.every((term) => title.includes(term));
    });
}

export function getProbability(remaining, total) {
    return total > 0 ? remaining / total * 100 : 0;
}

export function buildRankOdds(prizes, total) {
    const ranks = new Map();
    for (const prize of prizes) {
        ranks.set(prize.rank, (ranks.get(prize.rank) || 0) + prize.remaining);
    }
    return [...ranks].sort(([a], [b]) => a.localeCompare(b)).map(([rank, remaining]) => ({
        rank,
        remaining,
        probability: getProbability(remaining, total)
    }));
}
