document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("userSearch");
    const rows = Array.from(document.querySelectorAll("tbody tr[data-username]"));
    const noResults = document.getElementById("noResults");
    const resultCount = document.getElementById("resultCount");

    if (!searchInput || !rows.length) return;

    // Minúsculas y sin tildes: "José" coincide con "jose"
    const normalize = (text) =>
        (text || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

    const updateCount = (visible, total) => {
        if (resultCount) {
            resultCount.textContent = `${visible} de ${total} usuarios`;
        }
    };

    const applyFilter = () => {

        const terms = normalize(searchInput.value.trim())
            .split(/\s+/)
            .filter(Boolean);

        let visibleCount = 0;

        rows.forEach((row) => {

            const haystack =
                normalize(row.dataset.username) + " " + normalize(row.dataset.role);

            // Cada palabra escrita debe aparecer en el nombre o en el rol
            const matches = terms.every((term) => haystack.includes(term));

            row.style.display = matches ? "" : "none";

            if (matches) visibleCount++;
        });

        updateCount(visibleCount, rows.length);

        if (noResults) {
            noResults.style.display = visibleCount === 0 ? "" : "none";
        }
    };

    updateCount(rows.length, rows.length);
    searchInput.addEventListener("input", applyFilter);

    // Si el navegador restaura el texto al volver atrás, aplica el filtro
    if (searchInput.value) applyFilter();
});