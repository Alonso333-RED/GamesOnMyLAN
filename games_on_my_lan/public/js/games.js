document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("gameSearch");
    const rows = document.querySelectorAll("table tbody tr");

    if (!searchInput) return;

    searchInput.addEventListener("input", () => {

        const query = searchInput.value.trim().toLowerCase();

        rows.forEach(row => {

            const gameName = row.querySelector(".text-primary")
                ?.textContent.trim().toLowerCase() || "";

            const authorName = row.children[2]
                ?.textContent.trim().toLowerCase() || "";

            const matches = gameName.includes(query) || authorName.includes(query);

            row.style.display = matches ? "" : "none";

        });

    });

});