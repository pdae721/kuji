import {
    drawKuji
}
from "./api.js";
import { renderProductImage } from "./images.js";


let results = [];

let currentIndex = 0;

let opened = false;


const ticket =
    document.getElementById(
        "ticket"
    );


const nextButton =
    document.getElementById(
        "nextDrawButton"
    );



function getParameters() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return {
        kujiId:
            params.get(
                "id"
            ),

        count:
            Number(
                params.get(
                    "count"
                )
            )
    };

}



async function initializeDraw() {

    const {
        kujiId,
        count
    } =
        getParameters();


    if (
        !kujiId
        ||
        !count
    ) {

        window.location.href =
            "/";

        return;

    }


    try {

        const response =
            await drawKuji(
                kujiId,
                count
            );


        results =
            response.results;


        currentIndex =
            0;


        showTicket();

    }

    catch (error) {

        alert(
            error.message
        );


        window.location.href =
            `/detail.html?id=${kujiId}`;

    }

}



function showTicket() {

    opened =
        false;


    ticket.style.display =
        "block";


    ticket.classList.remove(
        "open"
    );


    nextButton.style.display =
        "";


    nextButton.classList.remove(
        "active"
    );


    const result =
        results[
            currentIndex
        ];


    document.getElementById(
        "drawProgress"
    ).textContent =
        `${currentIndex + 1} / ${results.length}`;


    document.getElementById(
        "resultRank"
    ).textContent =
        result.rank;


    renderProductImage(document.getElementById("resultEmoji"), result);


    document.getElementById(
        "resultName"
    ).textContent =
        result.name;


    setRankColor(
        result.rank
    );

}



ticket.addEventListener(
    "click",
    function() {

        if (
            opened
        ) {

            return;

        }


        opened =
            true;


        ticket.classList.add(
            "open"
        );


        setTimeout(
            function() {

                nextButton.classList.add(
                    "active"
                );

            },
            750
        );

    }
);



nextButton.addEventListener(
    "click",
    function() {

        currentIndex++;


        if (
            currentIndex
            <
            results.length
        ) {

            showTicket();

            return;

        }


        showSummary();

    }
);



function showSummary() {

    ticket.style.display =
        "none";


    nextButton.style.display =
        "none";


    const summary =
        document.getElementById(
            "resultSummary"
        );


    const list =
        document.getElementById(
            "resultList"
        );


    summary.classList.add(
        "active"
    );


    list.innerHTML =
        "";


    results.forEach(
        function(result) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "result-item";


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


            renderProductImage(item.querySelector(".result-item-emoji"), result, { lazy: true });

            list.appendChild(
                item
            );

        }
    );

}



function getRankColor(
    rank
) {

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


    return (
        colors[rank]
        ||
        "#333"
    );

}



function setRankColor(
    rank
) {

    const color =
        getRankColor(
            rank
        );


    document.getElementById(
        "resultRank"
    ).style.background =
        color;


    document.querySelector(
        ".ticket-back"
    ).style.borderColor =
        color;

}



document.getElementById(
    "returnDetailButton"
).addEventListener(
    "click",
    function() {

        const {
            kujiId
        } =
            getParameters();


        window.location.href =
            `/detail.html?id=${kujiId}`;

    }
);


initializeDraw();
