async function loadProfile() {

    const respuesta = await fetch("/api/profile");

    if (!respuesta.ok) {
        window.location.href = "/login";
        return;
    }

    const usuario = await respuesta.json();

    document.getElementById("username").textContent =
        usuario.username;

}

loadProfile();