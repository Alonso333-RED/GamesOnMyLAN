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

        if (error.code === "23505") {
            return res.redirect("/register?error=taken");
        }

        res.redirect("/register?error=1");
    }
}

async function showRegister(req, res) {

    const errorParam = req.query.error;

    res.render("register", {
        title: "Registro de usuario",
        error: Boolean(errorParam),
        errorTaken: errorParam === "taken"
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
            profileUser: user,
            isOwnProfile: true,
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

    const isOwnProfile = Boolean(
        req.session.user &&
        req.session.user.id === anotherUser.id_user
    );

    const games = await gamesService.getGamesByAuthorId(anotherUser.id_user);

    res.render("profile", {
        title: "Perfil",
        profileUser: anotherUser,
        isOwnProfile,
        games
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