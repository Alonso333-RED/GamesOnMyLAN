import gamesService from "../services/gamesService.js";
import storageService from "../services/storageService.js";
import settings from "../admin/getSettings.js";
import fsp from "fs/promises";
import { validateEntryFile, ENTRY_FILE_ERROR, assertPngFile } from "../utils/validators.js";
import userService from "../services/userService.js";
import { canDeleteGame } from "../utils/permissions.js";

const GAMES_PORT = settings.games_port || (settings.app_port || 3000) + 1;

async function cleanupUploads(files) {
    const all = Object.values(files ?? {}).flat();
    await Promise.all(all.map(f => fsp.unlink(f.path).catch(() => {})));
}

// Errores del usuario (status 400, ej. "no es un PNG válido") se devuelven
// tal cual; cualquier otro error es un fallo interno y solo se informa en general.
function sendError(res, error, fallbackMessage) {

    if (error.status === 400) {
        return res.status(400).send(error.message);
    }

    res.status(500).send(fallbackMessage);
}

async function createGame(req, res) {

    let game = null;

    try {

        const entryFile = validateEntryFile(req.body.entry_file);

        if (!entryFile) {
            return res.status(400).send(ENTRY_FILE_ERROR);
        }

        // Valida la miniatura ANTES de crear el registro y extraer el zip,
        // para no hacer trabajo (ni dejar restos) si la imagen no sirve.
        if (req.files?.thumbnail?.[0]) {
            await assertPngFile(req.files.thumbnail[0].path);
        }

        game = await gamesService.createGame({
            game_name: req.body.game_name,
            game_description: req.body.game_description,
            entry_file: entryFile,
            author_id: req.session.user.id
        });

        await storageService.extractGame(
            req.files.gameFile[0],
            game.id_game,
            game.entry_file
        );

        // La miniatura es opcional: si no se subió, usamos la imagen por defecto.
        await storageService.storeThumbnail(
            req.files.thumbnail?.[0] ?? null,
            game.id_game
        );

        res.redirect("/games");

    } catch (error) {

        console.error(error);

        if (game) {
            await gamesService.deleteGame(game.id_game).catch((cleanupError) => {
                console.error("Error limpiando registro huérfano:", cleanupError);
            });
            await storageService.deleteGameFiles(game.id_game).catch((cleanupError) => {
                console.error("Error limpiando archivos huérfanos:", cleanupError);
            });
        }

        sendError(res, error, "Error creando juego");
    } finally {
        await cleanupUploads(req.files);
    }
}

async function getAllGames(req, res) {

    try {

        const games = await gamesService.getAllGames();

        res.render("games", {
            title: "Galería",
            games
        });

    } catch (error) {

        console.error(error);
        res.status(500).send("Error al obtener los juegos");

    }

}

async function playGame(req, res) {

    try {

        const gameId = req.params.id;

        const game = await gamesService.getGameById(gameId);

        if (!game) {
            return res.status(404).send("Juego no encontrado");
        }

        res.redirect(
            `https://${req.hostname}:${GAMES_PORT}/${game.id_game}/${encodeURI(game.entry_file)}`
        );

    } catch (error) {

        console.error(error);
        res.status(500).send("Error al obtener el juego");

    }

}

async function getGameById(req, res) {

    try {

        const gameId = req.params.id;

        const game = await gamesService.getGameById(gameId);
        

        if (!game) {
            return res.status(404).send("Juego no encontrado");
        }

        const isOwner = Boolean(
            req.session.user &&
            req.session.user.id === game.author_id
        );

        let canDelete = false;

        if (req.session.user) {
            const viewer = await userService.getUserById(req.session.user.id);

            canDelete = canDeleteGame({
                actorId: req.session.user.id,
                actorRole: viewer?.role_name,
                authorId: game.author_id,
                authorRole: game.author_role
            });
        }

        res.render("game", {
            title: "Detalles del juego",
            game,
            isOwner,
            canDelete
        });

    } catch (error) {

        console.error(error);
        res.status(500).send("Error al obtener los detalles del juego");

    }

}

async function deleteGame(req, res) {

    try {

        const gameId = req.params.id;

        const deletedGame = await gamesService.deleteGame(gameId);

        if (!deletedGame) {
            return res.status(404).send("Juego no encontrado");
        }

        if (!req.moderation.isAuthor) {
            console.warn(
                `[MODERACIÓN] ${new Date().toISOString()} ` +
                `usuario #${req.session.user.id} (${req.moderation.actorRole}) eliminó ` +
                `el juego #${deletedGame.id_game} ${JSON.stringify(deletedGame.game_name)} ` +
                `del usuario #${deletedGame.author_id} (${req.moderation.authorRole})`
            );
        }

        await storageService.deleteGameFiles(deletedGame.id_game);

        res.redirect("/games");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error al eliminar el juego");

    }

}

async function getEditGame(req, res) {
    const game = await gamesService.getGameById(req.params.id);

    if (!game) {
        return res.status(404).send("Juego no encontrado");
    }

    res.render("update_game", {
        title: "Editar juego",
        game
    });
}

async function updateGame(req, res) {

    try {

        const gameId = req.params.id;
        const currentGame = await gamesService.getGameById(gameId);

        if (!currentGame) {
            return res.status(404).send("Juego no encontrado");
        }

        const entryFile = validateEntryFile(req.body.entry_file);

        if (!entryFile) {
            return res.status(400).send(ENTRY_FILE_ERROR);
        }

        if (req.files?.thumbnail?.[0]) {
            await assertPngFile(req.files.thumbnail[0].path);
        }

        const updatedGame = await gamesService.updateGame(gameId, {
            game_name: req.body.game_name,
            game_description: req.body.game_description,
            entry_file: entryFile
        });

        try {

            if (req.files?.gameFile?.[0]) {
                await storageService.replaceGameFiles(
                    gameId,
                    req.files.gameFile[0],
                    updatedGame.entry_file
                );
            }

            if (req.files?.thumbnail?.[0]) {
                await storageService.storeThumbnail(
                    req.files.thumbnail[0],
                    updatedGame.id_game
                );
            }

        } catch (fileError) {

            // Los archivos fallaron: revierte los metadatos a como estaban
            // antes, para que la DB no diga algo distinto a lo que hay en disco.
            await gamesService.updateGame(gameId, {
                game_name: currentGame.game_name,
                game_description: currentGame.game_description,
                entry_file: currentGame.entry_file
            }).catch((rollbackError) => {
                console.error("Error revirtiendo metadatos:", rollbackError);
            });

            throw fileError;
        } 

        res.redirect(`/games/game-details/${gameId}`);

    } catch (error) {

        console.error(error);
        sendError(res, error, "Error actualizando el juego");

    } finally {
        await cleanupUploads(req.files);
    }
}


export default {
    createGame,
    getAllGames,
    playGame,
    getGameById,
    deleteGame,
    getEditGame,
    updateGame
};