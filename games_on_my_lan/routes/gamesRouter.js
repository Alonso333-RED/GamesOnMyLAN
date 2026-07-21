import express from "express";
import gamesService from "../services/gamesService.js";
import { requireLogin, requireRole } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

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

export default router;