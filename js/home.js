import {
    getKujiList
}
from "./api.js";
import { renderProductImage } from "./images.js";


const grid =
    document.getElementById(
        "kujiGrid"
    );


const themeClass = {
    "happy-drive":
        "pink",

    "mermaid-movie":
        "blue",

    "halloween-pouch":
        "orange"
};


const themeEmoji = {
    "happy-drive":
        "🚗",

    "mermaid-movie":
        "🧜‍♀️",

    "halloween-pouch":
        "🎃"
};


async function initializeHome() {

    try {

        const items =
            await getKujiList();


        renderKujiList(
            items
        );

    }

    catch (error) {

        console.error(
            error
        );


        grid.innerHTML = `
            <p>
                상품 정보를 불러오지 못했습니다.
            </p>
        `;

    }

}



function renderKujiList(
    items
) {

    grid.innerHTML =
        "";


    items.forEach(
        function(item) {

            const percentage =
                item.totalStock > 0
                ?
                (
                    item.remainingStock
                    /
                    item.totalStock
                )
                *
                100
                :
                0;


            const soldOut =
                item.remainingStock
                ===
                0;


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "kuji-card";


            card.innerHTML = `

                <div
                    class="
                        kuji-image
                        ${themeClass[item.id] || "pink"}
                    "
                >

                    <span
                        class="
                            sale-badge
                            ${item.remainingStock <= 3 ? "hot" : ""}
                        "
                    >
                        ${
                            soldOut
                                ? "품절"
                                : item.remainingStock <= 3
                                    ? "품절 임박"
                                    : "판매중"
                        }
                    </span>


                    <div
                        class="kuji-placeholder"
                    >
                        ${themeEmoji[item.id] || "🎁"}
                    </div>

                </div>


                <div class="kuji-content">

                    <span
                        class="kuji-category"
                    >
                        CHIIKAWA KUJI
                    </span>


                    <h3>
                        ${item.title}
                    </h3>


                    <div
                        class="kuji-meta"
                    >

                        <div>
                            <span>
                                1회
                            </span>

                            <strong>
                                ${
                                    item.price
                                        .toLocaleString()
                                }원
                            </strong>
                        </div>


                        <div>
                            <span>
                                남은 수량
                            </span>

                            <strong>
                                ${item.remainingStock}
                                /
                                ${item.totalStock}
                            </strong>
                        </div>

                    </div>


                    <div
                        class="stock-bar"
                    >
                        <div
                            class="
                                stock-fill
                                ${
                                    percentage <= 30
                                        ? "low"
                                        : ""
                                }
                            "

                            style="
                                width:
                                ${percentage}%;
                            "
                        >
                        </div>
                    </div>


                    <button
                        type="button"

                        class="draw-button"

                        data-kuji-id="${item.id}"

                        ${soldOut ? "disabled" : ""}
                    >
                        ${
                            soldOut
                                ? "품절"
                                : "쿠지 보러가기"
                        }
                    </button>

                </div>

            `;


            renderProductImage(card.querySelector(".kuji-placeholder"), item, { lazy: true });

            const button =
                card.querySelector(
                    ".draw-button"
                );


            if (!soldOut) {

                button.addEventListener(
                    "click",
                    function() {

                        window.location.href =
                            `/detail.html?id=${item.id}`;

                    }
                );

            }


            grid.appendChild(
                card
            );

        }
    );

}


initializeHome();
