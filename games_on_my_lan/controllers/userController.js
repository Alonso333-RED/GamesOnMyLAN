import userService from '../services/userService.js';
import gamesService from "../services/gamesService.js";
import storageService from "../services/storageService.js";
import { regenerateSession, saveSession } from "../utils/session.js";
import fsp from "fs/promises";

async function register(req, res) {
    const { username, password } = req.body;

    try {
        const userId = await userService.registerUser(username, password);

        await regenerateSession(req);
        req.session.user = {
            id: userId,
            username: username
        };
        await saveSession(req);

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

    // Con await, un error de BD llega al manejador de errores de Express
    // (500) en vez de quedar como promesa rechazada sin capturar, que tumbaba
    // el proceso completo.
    const games = await gamesService.getGamesByAuthorId(
        req.session.user.id
    );

    res.render("profile", {
        title: "Perfil",
        profileUser: user,
        isOwnProfile: true,
        games
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

        let canManageRoles = false;

        if (req.session.user) {
            const viewer = await userService.getUserById(req.session.user.id);
            canManageRoles = viewer?.role_name === "owner";
        }

        const rows = users.map((u) => {
            const isPromotable = u.role_name === "member";
            const isDemotable = u.role_name === "admin";

            return {
                ...u,
                canChangeRole: canManageRoles && (isPromotable || isDemotable),
                newRole: isDemotable ? "member" : "admin",
                newRoleLabel: isDemotable ? "Degradar a member" : "Ascender a admin"
            };
        });

        res.render("users", {
            title: "Usuarios",
            users: rows,
            canManageRoles
        });

    } catch (error) {

        console.error(error);
        res.status(500).send("Error al obtener los usuarios");

    }
}

async function updateAvatar(req, res) {

    try {

        if (!req.file) {
            return res.status(400).send("Debes seleccionar una imagen PNG");
        }

        await storageService.storeAvatar(req.file, req.session.user.id);

        res.redirect("/profile");

    } finally {
        // Si el temporal sigue ahí (falló la validación) se borra;
        // si ya se movió a data/avatars, no pasa nada.
        if (req.file) {
            await fsp.unlink(req.file.path).catch(() => {});
        }
    }
}

async function changeRole(req, res) {

    const targetId = req.params.userId;
    const newRole = req.body.role;

    if (!/^\d{1,9}$/.test(targetId)) {
        return res.status(404).send("Usuario no encontrado");
    }

    if (!["member", "admin"].includes(newRole)) {
        return res.status(400).send("Rol inválido");
    }

    try {

        const updated = await userService.updateUserRole(targetId, newRole);

        if (!updated) {
            return res.status(403).send("Usuario no encontrado o no modificable");
        }

        if (updated.old_role !== newRole) {
            console.warn(
                `[ROLES] ${new Date().toISOString()} ` +
                `owner #${req.session.user.id} cambió a #${updated.id_user} ` +
                `${JSON.stringify(updated.username)}: ${updated.old_role} -> ${newRole}`
            );
        }

        res.redirect("/users");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error al cambiar el rol");

    }
}

export default {
    register
    , showRegister
    , getSelfUser
    , getUserById
    , getAllUsers
    , changeRole
    , updateAvatar
};