import registerService from '../services/registerService.js';

async function register(req, res) {
    const { username, password } = req.body;

    try {
        const userId = await registerService.registerUser(username, password);

        req.session.user = {
            id: userId,
            username: username
        };

        res.redirect("/profile");
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).send("Error al registrar usuario");
    }
}

async function showRegister(req, res) {
    res.render("register", {
        title: "Registro de usuario"
    });
}

export default {
    register
    , showRegister
};