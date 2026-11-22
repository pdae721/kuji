import asyncio
import json
import os
import random
import tempfile

from pathlib import Path


# =========================================================
# 경로
# =========================================================

BASE_DIR = Path(__file__).resolve().parent
STOCK_FILE = BASE_DIR / "stock.json"


# =========================================================
# 동시 추첨 Lock
#
# 중요:
# Uvicorn worker 1개 환경에서 사용
# =========================================================

draw_lock = asyncio.Lock()


# =========================================================
# JSON 읽기
# =========================================================

def load_stock():
    with open(
        STOCK_FILE,
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


# =========================================================
# JSON 저장
#
# 임시 파일에 먼저 저장한 뒤
# stock.json으로 교체
# =========================================================

def save_stock(data):
    fd, temp_path = tempfile.mkstemp(
        dir=BASE_DIR,
        prefix="stock_",
        suffix=".tmp"
    )

    try:
        with os.fdopen(
            fd,
            "w",
            encoding="utf-8"
        ) as file:
            json.dump(
                data,
                file,
                ensure_ascii=False,
                indent=2
            )

        os.replace(
            temp_path,
            STOCK_FILE
        )

    except Exception:
        if os.path.exists(temp_path):
            os.remove(temp_path)

        raise


# =========================================================
# 전체 상품 목록
# =========================================================

def get_kuji_list():
    data = load_stock()

    result = []

    for kuji_id, kuji in data.items():
        result.append({
            "id": kuji_id,
            "title": kuji["title"],
            "price": kuji["price"],
            "emoji": kuji.get("emoji", "🎁"),
            "image": kuji.get("image"),
            "totalStock": kuji["initialStock"],
            "remainingStock": len(kuji["tickets"])
        })

    return result


# =========================================================
# 상세 화면용 경품 목록 생성
# =========================================================

def build_prize_list(tickets):
    grouped = {}

    for ticket in tickets:
        key = (ticket["rank"], ticket["name"], ticket.get("image"))
        if key not in grouped:
            grouped[key] = {
                "ticketId": ticket["id"],
                "rank": ticket["rank"],
                "name": ticket["name"],
                "emoji": ticket["emoji"],
                "image": ticket.get("image"),
                "remaining": 0
            }
        grouped[key]["remaining"] += 1

    prizes = list(grouped.values())

    rank_order = {
        "A": 1,
        "B": 2,
        "C": 3,
        "D": 4,
        "E": 5
    }

    prizes.sort(
        key=lambda prize: (
            rank_order.get(
                prize["rank"],
                999
            ),
            prize["ticketId"]
        )
    )

    return prizes


# =========================================================
# 상품 상세
# =========================================================

def get_kuji_detail(kuji_id):
    data = load_stock()

    kuji = data.get(kuji_id)

    if kuji is None:
        raise ValueError(
            "존재하지 않는 쿠지입니다."
        )

    return {
        "id": kuji_id,
        "title": kuji["title"],
        "price": kuji["price"],
        "emoji": kuji.get("emoji", "🎁"),
        "image": kuji.get("image"),
        "totalStock": kuji["initialStock"],
        "remainingStock": len(
            kuji["tickets"]
        ),
        "prizes": build_prize_list(
            kuji["tickets"]
        )
    }


# =========================================================
# 실제 추첨
# =========================================================

async def draw_kuji(
    kuji_id,
    count
):
    if count not in (
        1,
        3,
        5,
        10
    ):
        raise ValueError(
            "1회, 3회, 5회, 10회만 선택할 수 있습니다."
        )

    # =====================================================
    # 핵심 동시성 제어
    #
    # 추첨 → 재고 제거 → 파일 저장까지
    # 전부 하나의 Lock 안에서 처리
    #
    # 동시에 요청이 들어와도
    # 이 구간에는 한 요청만 들어올 수 있음
    # =====================================================

    async with draw_lock:
        data = load_stock()

        kuji = data.get(
            kuji_id
        )

        if kuji is None:
            raise ValueError(
                "존재하지 않는 쿠지입니다."
            )

        tickets = kuji["tickets"]

        remaining = len(
            tickets
        )

        # 완전 품절
        if remaining == 0:
            raise ValueError(
                "이미 품절된 쿠지입니다."
            )

        # 원하는 횟수보다 재고 부족
        if count > remaining:
            raise ValueError(
                f"현재 남은 쿠지는 {remaining}개입니다."
            )

        # =================================================
        # 중복되지 않는 티켓 index 선택
        # =================================================

        selected_indexes = random.sample(
            range(
                len(tickets)
            ),
            count
        )

        # 뒤쪽 index부터 삭제해야
        # 앞쪽 index 번호가 변하지 않음
        selected_indexes.sort(
            reverse=True
        )

        results = []

        for index in selected_indexes:
            prize = tickets.pop(
                index
            )

            results.append(
                prize
            )

        # 결과 순서도 랜덤하게
        random.shuffle(
            results
        )

        # =================================================
        # 실제 변경된 재고 저장
        # =================================================

        save_stock(
            data
        )

        # =================================================
        # 프론트로 결과 반환
        # =================================================

        return {
            "success": True,
            "kujiId": kuji_id,
            "count": count,
            "results": results,
            "remainingStock": len(
                tickets
            )
        }
