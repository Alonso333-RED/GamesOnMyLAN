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
})();
