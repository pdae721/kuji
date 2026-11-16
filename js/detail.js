/*
=================================================
KUJI POP
detail.js
=================================================
*/

import {
    getKujiDetail
}
from "./api.js";


let currentKuji = null;

let selectedCount = 1;


/*
=================================================
URL에서 상품 ID 읽기
=================================================
*/

function getKujiId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get(
        "id"
    );

}


/*
=================================================
상세 초기화
=================================================
*/

async function initializeDetail() {

    const kujiId =
        getKujiId();


    if (!kujiId) {

        alert(
            "상품 정보가 없습니다."
        );

        window.location.href =
            "index.html";

        return;

    }


    try {

        currentKuji =
            await getKujiDetail(
                kujiId
            );


        renderKujiDetail();

        setupCountButtons();

        setupDrawButton();

    }

    catch (error) {

        console.error(
            error
        );

        alert(
            "상품 정보를 불러오지 못했습니다."
        );

    }

}


/*
=================================================
상품 정보 화면 출력
=================================================
*/

function renderKujiDetail() {

    const remainingCount =
        document.getElementById(
            "remainingCount"
        );


    const totalPrice =
        document.getElementById(
            "totalPrice"
        );


    const stockValue =
        document.getElementById(
            "detailStockValue"
        );


    remainingCount.textContent =
        currentKuji.remainingStock;


    totalPrice.textContent =
        currentKuji.price
            .toLocaleString()
        +
        "원";


    const stockPercentage =
        (
            currentKuji.remainingStock
            /
            currentKuji.totalStock
        )
        *
        100;


    stockValue.style.width =
        `${stockPercentage}%`;

}


/*
=================================================
뽑기 횟수
=================================================
*/

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


/*
=================================================
가격
=================================================
*/

function updatePrice() {

    const totalPrice =
        document.getElementById(
            "totalPrice"
        );


    const drawButton =
        document.getElementById(
            "detailDrawButton"
        );


    const price =
        currentKuji.price
        *
        selectedCount;


    totalPrice.textContent =
        price.toLocaleString()
        +
        "원";


    drawButton.textContent =
        `${selectedCount}회 뽑기`;

}


/*
=================================================
뽑기 버튼
=================================================
*/

function setupDrawButton() {

    const drawButton =
        document.getElementById(
            "detailDrawButton"
        );


    drawButton.addEventListener(
        "click",
        function() {

            /*
            아직 추첨 안 함.

            draw.html로
            상품 ID와 횟수만 전달
            */


            if (
                selectedCount
                >
                currentKuji.remainingStock
            ) {

                alert(
                    "남은 쿠지가 부족합니다."
                );

                return;

            }


            window.location.href =
                `draw.html?id=${currentKuji.id}&count=${selectedCount}`;

        }
    );

}


/*
=================================================
뒤로가기
=================================================
*/

const backButton =
    document.getElementById(
        "detailBack"
    );


if (backButton) {

    backButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "index.html";

        }
    );

}


/*
실행
*/

initializeDetail();