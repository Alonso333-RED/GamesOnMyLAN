async function updateNavbar() {
    const response = await fetch("/api/profile");

    if (response.ok) {
        const link = document.getElementById("account-link");

        link.href = "/profile";
        link.textContent = "Perfil";
    }
}

updateNavbar();