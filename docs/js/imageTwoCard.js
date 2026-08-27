class ImageTwoCard extends HTMLElement {
  connectedCallback() {
    const img = this.getAttribute('img');
    const titulo1 = this.getAttribute('titulo1');
    const desc1 = this.getAttribute('desc1');
    const titulo2 = this.getAttribute('titulo2');
    const desc2 = this.getAttribute('desc2');

    // Guardamos los comandos antes de reemplazar el contenido
    const comandos = Array.from(this.querySelectorAll('code'))
      .map(code => code.textContent);

    this.innerHTML = `
      <div class="row justify-content-center text-center">

        <div class="col-12 col-md-8">

          <div class="mb-4">
            <p class="fw-bold mb-1">${titulo1}</p>
            <p class="text-tertiary mb-0">${desc1}</p>
          </div>

          <div class="mb-4">
            <img
              src="${img}"
              alt="${titulo1}"
              class="big-img img-fluid"
            />
          </div>

          <div>
            <p class="fw-bold mb-1">${titulo2}</p>
            <p class="text-tertiary mb-2">${desc2}</p>

            <div class="commands text-start">
              ${comandos.map(comando => `
                <pre><code>${comando}</code></pre>
              `).join('')}
            </div>

          </div>

        </div>

      </div>
    `;
  }
}

customElements.define('image-two-card', ImageTwoCard);