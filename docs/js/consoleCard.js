class ConsoleCard extends HTMLElement {
    connectedCallback() {
        const titulo = this.getAttribute("titulo") || "";
        const descripcion = this.getAttribute("descripcion") || "";
        const paso = this.getAttribute("paso") || "";
        const contenido = this.innerHTML;
        const commands = Array.from(this.querySelectorAll("code"))
            .map((node) => node.textContent.trim())
            .filter(Boolean)
            .join("\n");

        this.innerHTML = `
            <div class="console-card reveal" ${paso ? `id="paso-${paso}"` : ""}>
                <div class="console-card-header">
                    <span class="console-dot red"></span>
                    <span class="console-dot yellow"></span>
                    <span class="console-dot green"></span>
                    <span class="console-title">Terminal${paso ? ` · paso ${paso}` : ""}</span>
                    ${commands ? `<button type="button" class="copy-btn" data-copy>Copiar</button>` : ""}
                </div>
                <div class="console-card-body">
                    ${titulo ? `<h3>${paso ? `<span class="step-badge">${paso}</span>` : ""}${titulo}</h3>` : ""}
                    ${descripcion ? `<p>${descripcion}</p>` : ""}
                    <div class="console">${contenido}</div>
                </div>
            </div>
        `;

        const button = this.querySelector("[data-copy]");
        if (!button) return;

        button.addEventListener("click", async () => {
            const copied = await copyText(commands);
            button.textContent = copied ? "Copiado" : "Selecciona el texto";
            button.classList.toggle("is-copied", copied);
            setTimeout(() => {
                button.textContent = "Copiar";
                button.classList.remove("is-copied");
            }, 1400);
        });
    }
}

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

customElements.define("console-card", ConsoleCard);
