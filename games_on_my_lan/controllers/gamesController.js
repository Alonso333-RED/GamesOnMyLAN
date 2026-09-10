import gamesService from "../services/gamesService.js";
import storageService from "../services/storageService.js";

async function createGame(req, res) {

    try {

        const game = await gamesService.createGame({

            game_name: req.body.game_name,
            game_description: req.body.game_description,
            entry_file: req.body.entry_file,
            author_id: req.session.user.id

        });


        const gameFolder = await storageService.extractGame(
            req.files.gameFile[0],
            game.id_game,
            game.entry_file
        );

        await storageService.storeThumbnail(
            req.files.thumbnail[0],
            game.id_game
        );


        res.redirect("/games");

    } catch (error) {

        console.error(error);

        res.status(500).send("Error creando juego");

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
        `/game-files/${game.id_game}/${game.entry_file}`
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

        res.render("game", {
            title: "Detalles del juego",
            game,
            isOwner
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

        const updatedGame = await gamesService.updateGame(gameId, {
            game_name: req.body.game_name,
            game_description: req.body.game_description,
            entry_file: req.body.entry_file
        });

        // Si subieron un zip nuevo, reemplaza los archivos del juego
        if (req.files?.gameFile?.[0]) {

            await storageService.deleteGameFolder(gameId);

            await storageService.extractGame(
                req.files.gameFile[0],
                updatedGame.id_game,
                updatedGame.entry_file
            );
        }

        // Si subieron una miniatura nueva, reemplázala
        if (req.files?.thumbnail?.[0]) {

            await storageService.storeThumbnail(
                req.files.thumbnail[0],
                updatedGame.id_game
            );
        }

        res.redirect(`/games/game-details/${gameId}`);

    } catch (error) {

        console.error(error);
        res.status(500).send("Error actualizando el juego");

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