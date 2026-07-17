async function loadProfile() {
    const response = await fetch("/api/profile");

    if (!response.ok) {
        window.location.href = "/login";
        return;
    }

    const user = await response.json();

    document.getElementById("username").textContent = user.username;
    document.getElementById("role_name").textContent = user.role_name;
    document.getElementById("registered_at").textContent = user.registered_at;
}

loadProfile();