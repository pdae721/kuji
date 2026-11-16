/*
=================================================
KUJI POP
home.js
=================================================
*/

import {
    getKujiList
}
from "./api.js";


/*
페이지가 열리면
쿠지 목록을 서버에서 조회
*/

async function initializeHome() {

    try {

        const kujiList =
            await getKujiList();


        console.log(
            "쿠지 목록:",
            kujiList
        );


        setupDrawButtons();

    }

    catch (error) {

        console.error(
            error
        );

        alert(
            "쿠지 목록을 불러오지 못했습니다."
        );

    }

}


/*
=================================================
상품 버튼 이벤트
=================================================
*/

function setupDrawButtons() {

    const buttons =
        document.querySelectorAll(
            ".draw-button"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    /*
                    HTML에:

                    data-kuji-id="sweet-party"

                    를 넣을 예정
                    */

                    const kujiId =
                        button.dataset.kujiId;


                    /*
                    상세 페이지로 이동
                    */

                    window.location.href =
                        `detail.html?id=${kujiId}`;

                }
            );

        }
    );

}


/*
실행
*/

initializeHome();