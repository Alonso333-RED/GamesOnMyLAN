import express from 'express';
import favoritesController from '../controllers/favoritesController.js';
import { requireLogin } from '../middlewares/auth.js';

const router = express.Router();

router.post('/:gameId', requireLogin, favoritesController.addFavorite);
router.delete('/:gameId', requireLogin, favoritesController.deleteFavorite);
router.get('/:gameId', requireLogin, favoritesController.checkFavorite);

export default router;
