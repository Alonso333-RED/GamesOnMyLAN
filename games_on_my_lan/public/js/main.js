/* ============================================================
   GamesOnMyLan – interacciones globales (todas las páginas)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    /* ---------- Menú hamburguesa (móvil) ---------- */
    const navToggle = document.getElementById("navToggle");
    const siteNav = document.getElementById("siteNav");

    if (navToggle && siteNav) {

        navToggle.addEventListener("click", () => {
            const isOpen = siteNav.classList.toggle("open");
            navToggle.classList.toggle("open", isOpen);
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });

        // Cierra el menú al elegir un link (mejor UX en móvil)
        siteNav.querySelectorAll("a, button").forEach((el) => {
            el.addEventListener("click", () => {
                siteNav.classList.remove("open");
                navToggle.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* ---------- Brillo ambiental que sigue el puntero ---------- */
    const moveGlow = (event) => {
        document.body.style.setProperty("--pointer-x", `${event.clientX}px`);
        document.body.style.setProperty("--pointer-y", `${event.clientY}px`);
    };

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.addEventListener("pointermove", moveGlow, { passive: true });
    }

    /* ---------- Header con sombra al hacer scroll ---------- */
    const header = document.querySelector(".site-header");

    if (header) {
        const onScroll = () => {
            header.classList.toggle("scrolled", window.scrollY > 8);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* ---------- Animación de aparición al hacer scroll ---------- */
    const revealTargets = document.querySelectorAll(
        ".game-card, .info-block, .form-panel, .empty-state, .detail-panel"
    );

    if (revealTargets.length) {

        if ("IntersectionObserver" in window) {

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

            revealTargets.forEach((el, i) => {
                el.style.transitionDelay = `${Math.min(i * 40, 320)}ms`;
                observer.observe(el);
            });

        } else {
            revealTargets.forEach((el) => el.classList.add("in-view"));
        }
    }

    /* ---------- Botón "volver arriba" ---------- */
    const backToTop = document.createElement("button");
    backToTop.type = "button";
    backToTop.className = "back-to-top";
    backToTop.setAttribute("aria-label", "Volver arriba");
    backToTop.innerHTML = "↑";
    document.body.appendChild(backToTop);

    const toggleBackToTop = () => {
        backToTop.classList.toggle("visible", window.scrollY > 400);
    };
    toggleBackToTop();
    window.addEventListener("scroll", toggleBackToTop, { passive: true });

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    /* ---------- Mostrar/ocultar contraseña ---------- */
    document.querySelectorAll(".password-toggle").forEach((btn) => {
        btn.addEventListener("click", () => {
            const input = document.getElementById(btn.dataset.target);
            if (!input) return;

            const isHidden = input.type === "password";
            input.type = isHidden ? "text" : "password";
            btn.textContent = isHidden ? "🙈" : "👁️";
            btn.setAttribute(
                "aria-label",
                isHidden ? "Ocultar contraseña" : "Mostrar contraseña"
            );
        });
    });

    /* ---------- Límite de tamaño en archivos (data-max-mb) ---------- */
    /* El servidor vuelve a comprobarlo; esto solo ahorra una subida inútil. */
    document.querySelectorAll("input[type='file'][data-max-mb]").forEach((input) => {
        input.addEventListener("change", () => {
            const maxMb = Number(input.dataset.maxMb);
            const file = input.files[0];

            if (file && file.size > maxMb * 1024 * 1024) {
                window.alert(`El archivo pesa más de ${maxMb} MB. Elige uno más liviano.`);
                input.value = "";
                input.dispatchEvent(new Event("change"));
            }
        });
    });

    /* ---------- Confirmación antes de eliminar ---------- */
    document.querySelectorAll("[data-confirm]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            const message = form.dataset.confirm || "¿Estás seguro?";
            if (!window.confirm(message)) {
                event.preventDefault();
            }
        });
    });

});
