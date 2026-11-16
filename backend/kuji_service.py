import asyncio
import json
import random

from pathlib import Path


# =========================================================
# 파일 경로
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

STOCK_FILE = BASE_DIR / "stock.json"


# =========================================================
# 동시성 제어
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
# =========================================================

def save_stock(data):

    with open(
        STOCK_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            data,
            file,
            ensure_ascii=False,
            indent=2
        )


# =========================================================
# 쿠지 존재 확인
# =========================================================

def get_kuji(
    kuji_id
):

    data = load_stock()


    kuji = data.get(
        kuji_id
    )


    if kuji is None:

        raise ValueError(
            "존재하지 않는 쿠지입니다."
        )


    return kuji


# =========================================================
# 등급별 재고 계산
# =========================================================

def calculate_prize_stock(
    tickets
):

    result = {}


    for ticket in tickets:

        rank = ticket[
            "rank"
        ]


        if rank not in result:

            result[rank] = {
                "rank":
                    rank,

                "name":
                    ticket[
                        "name"
                    ],

                "emoji":
                    ticket[
                        "emoji"
                    ],

                "remaining":
                    0
            }


        result[
            rank
        ][
            "remaining"
        ] += 1


    rank_order = {
        "A": 1,
        "B": 2,
        "C": 3,
        "D": 4,
        "E": 5
    }


    prizes = list(
        result.values()
    )


    prizes.sort(
        key=lambda prize:
            rank_order.get(
                prize["rank"],
                999
            )
    )


    return prizes


# =========================================================
# 상세 정보
# =========================================================

def get_kuji_detail(
    kuji_id
):

    kuji = get_kuji(
        kuji_id
    )


    tickets = kuji[
        "tickets"
    ]


    return {
        "id":
            kuji_id,

        "title":
            kuji[
                "title"
            ],

        "price":
            kuji[
                "price"
            ],

        "remainingStock":
            len(
                tickets
            ),

        "prizes":
            calculate_prize_stock(
                tickets
            )
    }


# =========================================================
# 실제 추첨
# =========================================================

async def draw_kuji(
    kuji_id,
    count
):

    if count not in [
        1,
        3,
        5,
        10
    ]:

        raise ValueError(
            "1회, 3회, 5회, 10회만 선택할 수 있습니다."
        )


    # =====================================================
    # 핵심 동시성 제어
    #
    # 동시에 여러 요청이 들어와도
    # 추첨 + 재고 저장 구간은 한 요청만 실행
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


        tickets = kuji[
            "tickets"
        ]


        # ---------------------------------------------
        # 재고 부족
        # ---------------------------------------------

        if len(tickets) < count:

            raise ValueError(
                f"남은 쿠지는 {len(tickets)}개입니다."
            )


        # ---------------------------------------------
        # 실제 재고 배열에서 랜덤으로 선택
        # ---------------------------------------------

        selected_indexes = random.sample(
            range(
                len(tickets)
            ),
            count
        )


        # index가 큰 순서부터 제거
        #
        # 그래야 pop할 때 배열 index가 안 꼬임
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


        # ---------------------------------------------
        # 순서를 랜덤하게 다시 섞음
        # ---------------------------------------------

        random.shuffle(
            results
        )


        # ---------------------------------------------
        # 변경된 재고 저장
        # ---------------------------------------------

        save_stock(
            data
        )


        # ---------------------------------------------
        # 결과 반환
        # ---------------------------------------------

        return {
            "success":
                True,

            "kujiId":
                kuji_id,

            "count":
                count,

            "results":
                results,

            "remainingStock":
                len(
                    tickets
                )
        }