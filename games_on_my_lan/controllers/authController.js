import authService from "../services/authService.js";

async function login(req,res) {
    const { username, password } = req.body;

    const user = await authService.login(
        username,
        password
    );

    if (!user) {
        return res.status(401).send("Usuario o contraseña incorrectos");
    }


    req.session.user = {
        id: user.id_user,
    };

    res.redirect("/profile");
    
}

function logout(req, res) {

    req.session.destroy((err) => {

        if (err) {
            console.error("Error destruyendo sesión:", err);
            return res.status(500).send("Error cerrando sesión");
        }

        res.clearCookie("connect.sid");

        res.redirect("/login");
    });
}

function showLogin(req, res) {

    res.render("login", {
        title: "Iniciar sesión"
    });

}

export default {
    login,
    logout,
    showLogin
};