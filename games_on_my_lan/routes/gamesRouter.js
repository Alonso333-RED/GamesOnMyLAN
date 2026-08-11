import express from "express";
import gamesController from "../controllers/gamesController.js";
import { requireLogin, requireRole, requireOwnership } from "../middlewares/auth.js";
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
    gamesController.createGame
);


router.get(
    "/:id",
    gamesController.playGame
);

router.get("/", gamesController.getAllGames)

router.get(
    "/game-details/:id",
    gamesController.getGameById
);

router.delete(
    "/:id",
    requireLogin,
    requireOwnership,
    gamesController.deleteGame
);


export default router;