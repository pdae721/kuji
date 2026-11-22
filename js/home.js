import {
    getKujiList
}
from "./api.js";
import { renderProductImage } from "./images.js";
import { filterKujiList } from "./catalog-utils.js";

let allItems = [];
const searchInput = document.getElementById("kujiSearch");
const statusSelect = document.getElementById("kujiStatus");
const resultCount = document.getElementById("catalogResultCount");
const resetButton = document.getElementById("resetFilters");

function applyFilters() {
    const items = filterKujiList(allItems, searchInput.value, statusSelect.value);
    renderKujiList(items);
    resultCount.textContent = `전체 ${allItems.length}개 중 ${items.length}개 상품`;
    if (items.length === 0) {
        const empty = document.createElement("p");
        empty.className = "catalog-empty";
        empty.textContent = "조건에 맞는 상품이 없습니다. 다른 검색어를 입력하거나 초기화해 보세요.";
        grid.appendChild(empty);
    }
}

searchInput.addEventListener("input", applyFilters);
statusSelect.addEventListener("change", applyFilters);
document.getElementById("catalogFilters").addEventListener("submit", (event) => event.preventDefault());
resetButton.addEventListener("click", () => {
    searchInput.value = "";
    statusSelect.value = "all";
    applyFilters();
    searchInput.focus();
});


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


        allItems = items;
        searchInput.disabled = false;
        statusSelect.disabled = false;
        resetButton.disabled = false;
        applyFilters();

    }

    catch (error) {

        console.error(
            error
        );

        resultCount.textContent = "상품을 불러오지 못했습니다. 페이지를 새로고침해 주세요.";


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
