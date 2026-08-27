class RequirementItem extends HTMLElement {
  connectedCallback() {
    const img = this.getAttribute('img');
    const titulo = this.getAttribute('titulo');
    const desc = this.getAttribute('desc');
    const link = this.getAttribute('link');
    const linkTexto = this.getAttribute('link-texto') || 'Sitio principal';

    this.innerHTML = `
      <div class="row align-items-center mb-4 text-center text-md-start">
        <div class="col-12 col-md-3 mb-3 mb-md-0">
          <img src="${img}" alt="${titulo}" class="object-fit-contain" style="width: 150px; height: 150px; max-width: 100%;">
        </div>
        <div class="col-12 col-md-7 mb-3 mb-md-0">
          <p class="fw-bold mb-1">${titulo}</p>
          <p class="text-tertiary">${desc}</p>
        </div>
        <div class="col-12 col-md-2">
          <a href="${link}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
            ${linkTexto}
          </a>
        </div>
      </div>
    `;
  }
}
customElements.define('requirement-item', RequirementItem);