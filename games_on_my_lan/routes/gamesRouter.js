import express from "express";
import gamesService from "../services/gamesService.js";
import { requireLogin, requireRole } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", async (req,res)=>{

    const games = await gamesService.getGames();

    res.json(games);

});

router.get(
    "/new",
    requireLogin,
    requireRole("member","admin","owner"),
    (req,res)=>{
        res.sendFile(
            path.join(__dirname,"../public/new_game.html")
        );
    }
);

router.post(
    "/",
    requireLogin,
    requireRole("member","admin","owner"),

    upload.fields([
        {
            name:"gameFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),

    async(req,res)=>{

        const game = await gamesService.createGame({

            game_name: req.body.game_name,

            game_description: req.body.game_description,

            entry_file: req.body.entry_file,

            author_id: req.session.user.id

        });


        console.log("Juego creado:", game.id);


        // aquí:
        // crear data/games/{game.id}
        // extraer ZIP
        // mover thumbnail


        res.redirect("/games");

    }
);

router.get("/:id", async(req,res)=>{


    const game = await gamesService.getGameById(
        req.params.id
    );


    if(!game){
        return res.status(404).send("Juego no encontrado");
    }


    res.json(game);

});

router.delete(
    "/:id",
    requireLogin,

    async(req,res)=>{


        await gamesService.deleteGame(
            req.params.id,
            req.session.user.id
        );


        res.sendStatus(204);

    }
);


export default router;