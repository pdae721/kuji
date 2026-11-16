/*
=================================================
KUJI POP
draw.js
=================================================
*/

import {
    drawKuji
}
from "./api.js";


let drawResults = [];

let currentIndex = 0;

let opened = false;


/*
=================================================
URL 정보
=================================================
*/

function getDrawParameters() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return {

        kujiId:
            params.get("id"),

        count:
            Number(
                params.get("count")
            )

    };

}


/*
=================================================
초기화
=================================================
*/

async function initializeDraw() {

    const {
        kujiId,
        count
    } =
        getDrawParameters();


    if (
        !kujiId
        ||
        !count
    ) {

        alert(
            "잘못된 접근입니다."
        );

        window.location.href =
            "index.html";

        return;

    }


    /*
    ★ 여기서 서버에 추첨 요청
    */

    try {

        const response =
            await drawKuji(
                kujiId,
                count
            );


        /*
        서버가 확정한 결과
        */

        drawResults =
            response.results;


        currentIndex = 0;


        showTicket();

    }

    catch (error) {

        console.error(
            error
        );


        alert(
            "추첨 요청 중 문제가 발생했습니다."
        );

    }

}


/*
=================================================
티켓 준비
=================================================
*/

function showTicket() {

    opened = false;


    const ticket =
        document.getElementById(
            "ticket"
        );


    const nextButton =
        document.getElementById(
            "nextDrawButton"
        );


    ticket.classList.remove(
        "open"
    );


    nextButton.classList.remove(
        "active"
    );


    const result =
        drawResults[
            currentIndex
        ];


    document.getElementById(
        "drawProgress"
    ).textContent =
        `${currentIndex + 1} / ${drawResults.length}`;


    document.getElementById(
        "resultRank"
    ).textContent =
        result.rank;


    document.getElementById(
        "resultName"
    ).textContent =
        result.name;


    document.getElementById(
        "resultEmoji"
    ).textContent =
        result.emoji;


    setRankColor(
        result.rank
    );

}


/*
=================================================
티켓 클릭
=================================================
*/

const ticket =
    document.getElementById(
        "ticket"
    );


ticket.addEventListener(
    "click",
    function() {

        if (opened) {

            return;

        }


        opened = true;


        ticket.classList.add(
            "open"
        );


        setTimeout(
            function() {

                document
                    .getElementById(
                        "nextDrawButton"
                    )
                    .classList
                    .add("active");

            },
            750
        );

    }
);


/*
=================================================
다음 결과
=================================================
*/

const nextButton =
    document.getElementById(
        "nextDrawButton"
    );


nextButton.addEventListener(
    "click",
    function() {

        currentIndex++;


        if (
            currentIndex
            <
            drawResults.length
        ) {

            showTicket();

            return;

        }


        showSummary();

    }
);


/*
=================================================
전체 결과
=================================================
*/

function showSummary() {

    ticket.style.display =
        "none";


    nextButton.style.display =
        "none";


    const summary =
        document.getElementById(
            "resultSummary"
        );


    const resultList =
        document.getElementById(
            "resultList"
        );


    summary.classList.add(
        "active"
    );


    resultList.innerHTML =
        "";


    drawResults.forEach(
        function(result) {

            const item =
                document.createElement(
                    "div"
                );


            item.classList.add(
                "result-item"
            );


            item.innerHTML = `

                <div
                    class="result-item-rank"
                    style="
                        background:
                        ${getRankColor(result.rank)};
                    "
                >

                    ${result.rank}

                </div>


                <div
                    class="result-item-emoji"
                >

                    ${result.emoji}

                </div>


                <strong>

                    ${result.rank}상
                    ${result.name}

                </strong>

            `;


            resultList.appendChild(
                item
            );

        }
    );

}


/*
=================================================
등급 색상
=================================================
*/

function getRankColor(rank) {

    const colors = {

        A:
            "#ff3159",

        B:
            "#599ee8",

        C:
            "#8e6de5",

        D:
            "#58b77f",

        E:
            "#ec9c50"

    };


    return colors[rank]
        ||
        "#333";

}


function setRankColor(rank) {

    const rankBox =
        document.getElementById(
            "resultRank"
        );


    rankBox.style.background =
        getRankColor(
            rank
        );

}


/*
=================================================
상세로 돌아가기
=================================================
*/

const returnButton =
    document.getElementById(
        "returnDetailButton"
    );


returnButton.addEventListener(
    "click",
    function() {

        const {
            kujiId
        } =
            getDrawParameters();


        window.location.href =
            `detail.html?id=${kujiId}`;

    }
);


/*
=================================================
실행
=================================================
*/

initializeDraw();