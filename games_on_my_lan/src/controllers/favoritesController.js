import favoritesService from "../services/favoritesService.js";

async function addFavorite(req, res, next) {
    const favorite = {
        user_id: req.session.user.id,
        game_id: req.params.id_game
    };

    try {
        await favoritesService.addFavorite(favorite);
        return res.redirect("/games");
    } catch (error) {
        next(error);
    }
}

async function deleteFavorite(req, res, next) {
    const favorite = {
        user_id: req.session.user.id,
        game_id: req.params.id_game
    };

    try {
        await favoritesService.deleteFavorite(favorite);
        return res.redirect("/games");
    } catch (error) {
        next(error);
    }
}

export const checkFavorite = async (req, res, next) => {
    try {
        const favorite = {
            user_id: req.session.user.id,
            game_id: req.params.id_game
        };

        const isFavorited = await favoritesService.checkFavorite(
            favorite.user_id,
            favorite.game_id
        );

        return res.status(200).json({
            isFavorited
        });
    } catch (error) {
        next(error);
    }
};

export default {
    addFavorite,
    deleteFavorite,
    checkFavorite
};