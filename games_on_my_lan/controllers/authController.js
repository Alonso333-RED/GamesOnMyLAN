import authService from "../services/authService.js";
import { regenerateSession, saveSession } from "../utils/session.js";

async function login(req,res) {
    const { username, password } = req.body;

    const user = await authService.login(
        username,
        password
    );

    if (!user) {
        return res.redirect("/login?error=1");
    }


    await regenerateSession(req);
    req.session.user = {
        id: user.id_user,
    };
    await saveSession(req);

    res.redirect("/profile");
    
}

function logout(req, res) {

    req.session.destroy((err) => {

        if (err) {
            console.error("Error destruyendo sesión:", err);
            return res.status(500).send("Error cerrando sesión");
        }

        res.clearCookie("__Host-goml.sid", {
            path: "/",
            secure: true,
            httpOnly: true,
            sameSite: "strict"
        });

        res.redirect("/login");
    });
}

function showLogin(req, res) {

    res.render("login", {
        title: "Iniciar sesión",
        error: req.query.error === "1"
    });

}

export default {
    login,
    logout,
    showLogin
};