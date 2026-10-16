import express from "express";
import favoritesController from "../controllers/favoritesController.js";
import { requireLogin } from "../middlewares/auth.js";

const router = express.Router();

router.post(
    "/addFavorite/:id_game",
    requireLogin,
    favoritesController.addFavorite
);

router.delete(
    "/deleteFavorite/:id_game",
    requireLogin,
    favoritesController.deleteFavorite
);

router.get(
    "/checkFavorite/:id_game",
    requireLogin,
    favoritesController.checkFavorite
);

export default router;