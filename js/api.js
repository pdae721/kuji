/*
=================================================
KUJI POP
api.js

프론트엔드 → AWS API 요청 전담
=================================================
*/


/*
나중에 API Gateway 주소로 교체

예:

const API_BASE_URL =
    "https://xxxxx.execute-api.ap-northeast-2.amazonaws.com";
*/

const API_BASE_URL = "";


/*
=================================================
쿠지 목록 조회
=================================================
*/

export async function getKujiList() {

    /*
    나중에는:

    const response =
        await fetch(
            `${API_BASE_URL}/kuji`
        );

    return await response.json();
    */


    /*
    지금은 임시 데이터
    */

    return [
        {
            id: "sweet-party",

            title:
                "몽글몽글 친구들 Sweet Party",

            price: 8000,

            totalStock: 80,

            remainingStock: 42,

            status: "SALE"
        },

        {
            id: "room-collection",

            title:
                "포근한 하루 Room Collection",

            price: 9000,

            totalStock: 80,

            remainingStock: 14,

            status: "SALE"
        },

        {
            id: "picnic-day",

            title:
                "작은 숲의 친구들 Picnic Day",

            price: 7500,

            totalStock: 80,

            remainingStock: 63,

            status: "SALE"
        }
    ];

}


/*
=================================================
쿠지 상세 조회
=================================================
*/

export async function getKujiDetail(
    kujiId
) {

    /*
    실제 AWS 연결 후:

    const response =
        await fetch(
            `${API_BASE_URL}/kuji/${kujiId}`
        );

    return await response.json();
    */


    /*
    현재 임시 데이터
    */

    return {

        id: kujiId,

        title:
            "몽글몽글 친구들 Sweet Party",

        price: 8000,

        totalStock: 80,

        remainingStock: 42,

        prizes: [

            {
                rank: "A",
                name: "빅 사이즈 인형",
                remaining: 1,
                emoji: "🧸"
            },

            {
                rank: "B",
                name: "머그컵 세트",
                remaining: 3,
                emoji: "☕"
            },

            {
                rank: "C",
                name: "미니 파우치",
                remaining: 7,
                emoji: "👜"
            },

            {
                rank: "D",
                name: "디저트 스푼",
                remaining: 12,
                emoji: "🥄"
            },

            {
                rank: "E",
                name: "아크릴 키링",
                remaining: 19,
                emoji: "🎀"
            }

        ]

    };

}


/*
=================================================
쿠지 뽑기 요청
=================================================
*/

export async function drawKuji(
    kujiId,
    count
) {

    /*
    ★ 중요 ★

    나중에 실제 추첨은
    Lambda에서 처리함.

    프론트는 절대로
    Math.random()으로 결과를 정하지 않음.
    */


    /*
    실제 AWS 연결 후:

    const response =
        await fetch(
            `${API_BASE_URL}/draw`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        kujiId,
                        count
                    })
            }
        );


    if (!response.ok) {

        throw new Error(
            "추첨 요청 실패"
        );

    }


    return await response.json();
    */


    /*
    ------------------------------------------------
    현재는 서버가 없기 때문에
    "서버가 결과를 돌려줬다"고 가정하는 Mock
    ------------------------------------------------
    */

    const mockPrizes = [

        {
            rank: "A",
            name: "빅 사이즈 인형",
            emoji: "🧸"
        },

        {
            rank: "B",
            name: "머그컵 세트",
            emoji: "☕"
        },

        {
            rank: "C",
            name: "미니 파우치",
            emoji: "👜"
        },

        {
            rank: "D",
            name: "디저트 스푼",
            emoji: "🥄"
        },

        {
            rank: "E",
            name: "아크릴 키링",
            emoji: "🎀"
        }

    ];


    const results = [];


    /*
    지금만 임시 랜덤.

    실제 AWS 연결 시
    이 로직은 삭제됩니다.
    */

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const randomIndex =
            Math.floor(
                Math.random()
                *
                mockPrizes.length
            );


        results.push(
            mockPrizes[
                randomIndex
            ]
        );

    }


    return {

        kujiId,

        count,

        results,

        remainingStock:
            42 - count

    };

}