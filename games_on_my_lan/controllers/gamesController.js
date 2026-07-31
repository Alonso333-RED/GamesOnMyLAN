import gamesService from "../services/gamesService.js";

async function createGame(req, res) {

    try {

        const game = await gamesService.createGame({

            game_name: req.body.game_name,
            game_description: req.body.game_description,
            entry_file: req.body.entry_file,
            author_id: req.session.user.id

        });

        res.redirect("/");

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

export default {
    createGame,
    getAllGames
};