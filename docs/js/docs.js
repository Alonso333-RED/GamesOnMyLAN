(function () {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");
    const page = document.body.dataset.page;

    document.querySelectorAll(".site-nav a[data-page]").forEach((link) => {
        if (link.dataset.page === page) {
            link.classList.add("is-active");
        }
    });

    if (toggle && header) {
        toggle.addEventListener("click", () => {
            const open = header.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(open));
            toggle.textContent = open ? "Cerrar" : "Menú";
        });
    }

    const moveGlow = (event) => {
        document.body.style.setProperty("--pointer-x", `${event.clientX}px`);
        document.body.style.setProperty("--pointer-y", `${event.clientY}px`);
    };

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.addEventListener("pointermove", moveGlow, { passive: true });
    }

    document.querySelectorAll(".step-chip[href^='#']").forEach((chip) => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".step-chip").forEach((item) => item.classList.remove("is-current"));
            chip.classList.add("is-current");
        });
    });

    document.querySelectorAll("[data-copy]").forEach((button) => {
        button.addEventListener("click", async () => {
            const card = button.closest(".console-card");
            const commands = card
                ? Array.from(card.querySelectorAll("code"))
                    .map((node) => node.textContent.trim())
                    .filter(Boolean)
                    .join("\n")
                : "";
            const copied = await copyText(commands);
            button.textContent = copied ? "Copiado" : "Selecciona el texto";
            button.classList.toggle("is-copied", copied);
            setTimeout(() => {
                button.textContent = "Copiar";
                button.classList.remove("is-copied");
            }, 1400);
        });
    });

    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (_error) {
            const field = document.createElement("textarea");
            field.value = text;
            field.setAttribute("readonly", "");
            field.style.position = "fixed";
            field.style.left = "-9999px";
            document.body.appendChild(field);
            field.select();
            const ok = document.execCommand("copy");
            field.remove();
            return ok;
        }
    }
})();
