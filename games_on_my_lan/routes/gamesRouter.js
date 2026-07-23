import express from "express";
import gamesController from "../controllers/gamesController.js";
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
    gamesController.createGame
);

export default router;