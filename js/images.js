export function renderProductImage(container, item, { lazy = false } = {}) {
    container.replaceChildren();

    if (!item.image) {
        container.textContent = item.emoji || "🎁";
        return;
    }

    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.title || `${item.rank}상 ${item.name}`;
    image.loading = lazy ? "lazy" : "eager";
    image.decoding = "async";
    container.appendChild(image);
}
