import {
    getKujiDetail
}
from "./api.js";
import { renderProductImage } from "./images.js";


let currentKuji = null;

let selectedCount = 1;



function getKujiId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get(
        "id"
    );

}



async function initializeDetail() {

    const kujiId =
        getKujiId();


    if (!kujiId) {

        window.location.href =
            "/";

        return;

    }


    try {

        currentKuji =
            await getKujiDetail(
                kujiId
            );


        renderDetail();

        setupCountButtons();

        setupDrawButton();

    }

    catch (error) {

        alert(
            error.message
        );

        window.location.href =
            "/";

    }

}



function renderDetail() {

    document.getElementById(
        "kujiTitle"
    ).textContent =
        currentKuji.title;


    document.getElementById(
        "pricePerDraw"
    ).textContent =
        currentKuji.price
            .toLocaleString()
        +
        "원";


    document.getElementById(
        "remainingCount"
    ).textContent =
        currentKuji.remainingStock;


    document.getElementById(
        "totalStockText"
    ).textContent =
        `/ ${currentKuji.totalStock}`;


    const percentage =
        (
            currentKuji.remainingStock
            /
            currentKuji.totalStock
        )
        *
        100;


    document.getElementById(
        "detailStockValue"
    ).style.width =
        `${percentage}%`;


    renderProductImage(document.getElementById("mainPrizeImage"), currentKuji);


    renderPrizes();

    updateCountButtons();

    updatePrice();

}



function renderPrizes() {

    const list =
        document.getElementById(
            "prizeList"
        );


    list.innerHTML =
        "";


    currentKuji.prizes.forEach(
        function(prize) {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "prize-item";


            item.innerHTML = `

                <div
                    class="
                        prize-rank
                        rank-${prize.rank.toLowerCase()}
                    "
                >
                    ${prize.rank}
                </div>


                <div
                    class="prize-image"
                >
                    ${prize.emoji}
                </div>


                <div
                    class="prize-info"
                >

                    <strong>
                        ${prize.rank}상
                    </strong>

                    <h3>
                        ${prize.name}
                    </h3>

                    <p>
                        현재 재고 기준
                    </p>

                </div>


                <div
                    class="prize-stock"
                >
                    <span>
                        남음
                    </span>

                    <strong>
                        ${prize.remaining}
                    </strong>
                </div>

            `;


            renderProductImage(item.querySelector(".prize-image"), prize, { lazy: true });

            list.appendChild(
                item
            );

        }
    );

}



function setupCountButtons() {

    const buttons =
        document.querySelectorAll(
            ".count-button"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    if (
                        button.disabled
                    ) {

                        return;

                    }


                    buttons.forEach(
                        function(btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    selectedCount =
                        Number(
                            button.dataset.count
                        );


                    updatePrice();

                }
            );

        }
    );

}



function updateCountButtons() {

    const buttons =
        document.querySelectorAll(
            ".count-button"
        );


    buttons.forEach(
        function(button) {

            const count =
                Number(
                    button.dataset.count
                );


            button.disabled =
                count
                >
                currentKuji.remainingStock;

        }
    );


    if (
        selectedCount
        >
        currentKuji.remainingStock
    ) {

        selectedCount =
            1;

    }

}



function updatePrice() {

    const total =
        currentKuji.price
        *
        selectedCount;


    document.getElementById(
        "totalPrice"
    ).textContent =
        total.toLocaleString()
        +
        "원";


    const drawButton =
        document.getElementById(
            "detailDrawButton"
        );


    if (
        currentKuji.remainingStock
        ===
        0
    ) {

        drawButton.disabled =
            true;

        drawButton.textContent =
            "품절";

        return;

    }


    drawButton.disabled =
        false;


    drawButton.textContent =
        `${selectedCount}회 뽑기`;

}



function setupDrawButton() {

    const button =
        document.getElementById(
            "detailDrawButton"
        );


    button.addEventListener(
        "click",
        function() {

            window.location.href =
                `/draw.html?id=${currentKuji.id}&count=${selectedCount}`;

        }
    );

}



document.getElementById(
    "detailBack"
).addEventListener(
    "click",
    function() {

        window.location.href =
            "/";

    }
);


initializeDetail();
