import gamesService from "../services/gamesService.js";

async function createGame(req,res){

    try {

        const game = await gamesService.createGame({

            game_name: req.body.game_name,
            game_description: req.body.game_description,
            entry_file: req.body.entry_file,
            author_id: req.session.user.id

        });


        console.log("Juego creado:", game.id);

        res.redirect("/games");

    } catch(error){

        console.error(error);
        res.status(500).send("Error creando juego");

    }

}

export default {
    createGame
};