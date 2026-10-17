import favoritesService from '../services/favoritesService.js';

async function addFavorite(req, res) {
  await favoritesService.addFavorite({
    user_id: req.session.user.id,
    game_id: req.params.gameId,
  });

  res.redirect('/games');
}

async function deleteFavorite(req, res) {
  await favoritesService.deleteFavorite({
    user_id: req.session.user.id,
    game_id: req.params.gameId,
  });

  res.redirect('/games');
}

async function checkFavorite(req, res) {
  const isFavorited = await favoritesService.checkFavorite(req.session.user.id, req.params.gameId);

  res.json({ isFavorited });
}

export default {
  addFavorite,
  deleteFavorite,
  checkFavorite,
};
