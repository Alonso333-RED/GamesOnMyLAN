class HorizontalCard extends HTMLElement {
  connectedCallback() {
    const img = this.getAttribute("img");
    const titulo = this.getAttribute("titulo");
    const desc = this.getAttribute("desc");

    this.innerHTML = `
      <article class="horizontal-card reveal">
        <div class="row align-items-center text-center text-md-start">
          <div class="col-12 col-md-3 mb-3 mb-md-0">
            <img src="${img}" alt="${titulo}">
          </div>
          <div class="col-12 col-md-9">
            <p class="card-title">${titulo}</p>
            <p class="text-tertiary mb-0">${desc}</p>
          </div>
        </div>
      </article>
    `;
  }
}

customElements.define("horizontal-card", HorizontalCard);
