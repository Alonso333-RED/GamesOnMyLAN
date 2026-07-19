import express from "express";
import gamesService from "../services/gamesService.js";
import { requireLogin, requireRole } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/games", async (req,res)=>{

    const games = await gamesService.getGames();

    res.json(games);

});

router.get(
    "/games/new",
    requireLogin,
    requireRole("member","admin","owner"),
    (req,res)=>{

        res.render("games/new");

    }
);

router.post(
    "/games",
    requireLogin,
    requireRole("member","admin","owner"),
    upload.single("gameFile"),

    async(req,res)=>{


        const game = {

            name: req.body.name,

            description: req.body.description,

            file_path: req.file.filename,

            user_id: req.session.user.id

        };


        await gamesService.createGame(game);


        res.redirect("/games");

    }
);

router.get("/games/:id", async(req,res)=>{


    const game = await gamesService.getGameById(
        req.params.id
    );


    if(!game){
        return res.status(404).send("Juego no encontrado");
    }


    res.json(game);

});

router.delete(
    "/games/:id",
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