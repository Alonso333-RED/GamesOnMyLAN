class ConsoleCard extends HTMLElement {

    connectedCallback() {

        const titulo = this.getAttribute("titulo") || "";
        const descripcion = this.getAttribute("descripcion") || "";

        const contenido = this.innerHTML;

        this.innerHTML = `
            <div class="console-card">

                <div class="console-card-header">
                    <span class="console-dot red"></span>
                    <span class="console-dot yellow"></span>
                    <span class="console-dot green"></span>
                    <span class="console-title">Terminal</span>
                </div>

                <div class="console-card-body">

                    ${titulo ? `<h3>${titulo}</h3>` : ""}

                    ${descripcion ? `<p>${descripcion}</p>` : ""}

                    <div class="console">
                        ${contenido}
                    </div>

                </div>

            </div>
        `;
    }
}

customElements.define("console-card", ConsoleCard);