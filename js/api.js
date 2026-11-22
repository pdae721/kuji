/*
=================================================
KUJI POP API
=================================================
*/


export async function getKujiList() {

    const response =
        await fetch(
            "/api/kuji"
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail
            ||
            "쿠지 목록을 불러오지 못했습니다."
        );

    }


    return data;
}



export async function getKujiDetail(
    kujiId
) {

    const response =
        await fetch(
            `/api/kuji/${kujiId}`
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail
            ||
            "상품 정보를 불러오지 못했습니다."
        );

    }


    return data;
}



export async function drawKuji(
    kujiId,
    count
) {

    const response =
        await fetch(
            "/api/draw",
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        kujiId:
                            kujiId,

                        count:
                            count
                    })
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail
            ||
            "뽑기에 실패했습니다."
        );

    }


    return data;
}