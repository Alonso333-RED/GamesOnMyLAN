import userService from '../services/userService.js';
import gamesService from "../services/gamesService.js";

async function register(req, res) {
    const { username, password } = req.body;

    try {
        const userId = await userService.registerUser(username, password);

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

async function getSelfUser(req, res) {

    if (!req.session.user) {
        return res.redirect("/login");
    }


    const user = await userService.getUserById(
        req.session.user.id
    );


    if (!user) {
        return res.status(404).send(
            "Usuario no encontrado"
        );
    }
    
    gamesService.getGamesByAuthorId(req.session.user.id).then(games => {
        res.render("profile", {
            title: "Perfil",
            user,
            games
        });
    });

}

async function getUserById(req, res) {
    const userId = req.params.userId;
    const anotherUser = await userService.getUserById(userId);

    if (!anotherUser) {
        return res.status(404).send(
            "Usuario no encontrado"
        );
    }

    userService.getUserById(userId).then(user => {
        res.render("profile", {
            title: "Perfil",
            user: anotherUser,
            games: user.games
        });
    });
    
}

async function getAllUsers(req, res) {

    try {

        const users = await userService.getAllUsers();

        res.render("users", {
            title: "Usuarios",
            users
        });

    } catch (error) {

        console.error(error);
        res.status(500).send("Error al obtener los usuarios");

    }
}

export default {
    register
    , showRegister
    , getSelfUser
    , getUserById
    , getAllUsers
};