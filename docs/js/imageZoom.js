(function () {
    function openModal(thumb) {
        const img = thumb.querySelector("img");
        const caption = thumb.dataset.caption;

        const backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop";
        backdrop.innerHTML = `
            <div class="modal-box" role="dialog" aria-modal="true" aria-label="${img.alt}">
                <button class="modal-close" type="button" aria-label="Cerrar">×</button>
                <img src="${img.src}" alt="${img.alt}">
                ${caption ? `<p class="modal-caption">${caption}</p>` : ""}
            </div>`;

        function close() {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
            backdrop.remove();
            thumb.focus();
        }

        function onKey(event) {
            if (event.key === "Escape") close();
        }

        backdrop.addEventListener("click", close);
        backdrop.querySelector(".modal-box").addEventListener("click", (event) => event.stopPropagation());
        backdrop.querySelector(".modal-close").addEventListener("click", close);

        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        document.body.appendChild(backdrop);
        backdrop.querySelector(".modal-close").focus();
    }

    document.querySelectorAll(".zoom-thumb").forEach((thumb) => {
        thumb.addEventListener("click", () => openModal(thumb));
    });
})();
