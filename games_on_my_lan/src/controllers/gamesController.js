import fsp from 'fs/promises';
import gamesService from '../services/gamesService.js';
import storageService from '../services/storageService.js';
import favoritesService from '../services/favoritesService.js';
import usersService from '../services/usersService.js';
import { getGamesOrigin } from '../config.js';
import {
  validateEntryFile,
  ENTRY_FILE_ERROR,
  assertPngFile,
  isValidId,
} from '../utils/validators.js';
import { canDeleteGame } from '../utils/permissions.js';

async function cleanupUploads(files) {
  const all = Object.values(files ?? {}).flat();
  await Promise.all(all.map((f) => fsp.unlink(f.path).catch(() => {})));
}

function showNewGame(req, res) {
  res.render('new_game', {
    title: 'Nuevo Juego',
  });
}

async function createGame(req, res) {
  let game = null;

  try {
    const entryFile = validateEntryFile(req.body.entry_file);

    if (!entryFile) {
      return res.status(400).send(ENTRY_FILE_ERROR);
    }

    // Valida la miniatura ANTES de crear el registro y extraer el zip,
    // para no hacer trabajo (ni dejar restos) si la imagen no sirve.
    if (req.files?.thumbnail?.[0]) {
      await assertPngFile(req.files.thumbnail[0].path);
    }

    game = await gamesService.createGame({
      game_name: req.body.game_name,
      game_description: req.body.game_description,
      entry_file: entryFile,
      author_id: req.session.user.id,
    });

    await storageService.extractGame(req.files.gameFile[0], game.id_game, game.entry_file);

    // La miniatura es opcional: si no se subió, usamos la imagen por defecto.
    await storageService.storeThumbnail(req.files.thumbnail?.[0] ?? null, game.id_game);

    res.redirect('/games');
  } catch (error) {
    if (game) {
      await gamesService.deleteGame(game.id_game).catch((cleanupError) => {
        console.error('Error limpiando registro huérfano:', cleanupError);
      });
      await storageService.deleteGameFiles(game.id_game).catch((cleanupError) => {
        console.error('Error limpiando archivos huérfanos:', cleanupError);
      });
    }

    // El manejador de errores de app.js responde al usuario
    throw error;
  } finally {
    await cleanupUploads(req.files);
  }
}

async function showGames(req, res) {
  const userId = req.session.user?.id ?? null;

  const games = await gamesService.getAllGames(userId);

  res.render('games', {
    title: 'Galería',
    games,
  });
}

async function playGame(req, res) {
  if (!isValidId(req.params.gameId)) {
    return res.status(404).send('Juego no encontrado');
  }

  const game = await gamesService.getGameById(req.params.gameId);

  if (!game) {
    return res.status(404).send('Juego no encontrado');
  }

  res.redirect(`${getGamesOrigin(req)}/${game.id_game}/${encodeURI(game.entry_file)}`);
}

async function showGameDetails(req, res) {
  const gameId = req.params.gameId;

  if (!isValidId(gameId)) {
    return res.status(404).send('Juego no encontrado');
  }

  const game = await gamesService.getGameById(gameId);

  if (!game) {
    return res.status(404).send('Juego no encontrado');
  }

  const user = req.session.user;
  let isFavorite = false;
  let canDelete = false;

  if (user) {
    isFavorite = await favoritesService.checkFavorite(user.id, gameId);

    const viewer = await usersService.getUserById(user.id);

    canDelete = canDeleteGame({
      actorId: user.id,
      actorRole: viewer?.role_name,
      authorId: game.author_id,
      authorRole: game.author_role,
    });
  }

  const isOwner = Boolean(user && user.id === game.author_id);

  res.render('game', {
    title: 'Detalles del juego',
    game,
    isOwner,
    canDelete,
    isFavorite,
  });
}

async function deleteGame(req, res) {
  const deletedGame = await gamesService.deleteGame(req.params.gameId);

  if (!deletedGame) {
    return res.status(404).send('Juego no encontrado');
  }

  if (!req.moderation.isAuthor) {
    console.warn(
      `[MODERACIÓN] ${new Date().toISOString()} ` +
        `usuario #${req.session.user.id} (${req.moderation.actorRole}) eliminó ` +
        `el juego #${deletedGame.id_game} ${JSON.stringify(deletedGame.game_name)} ` +
        `del usuario #${deletedGame.author_id} (${req.moderation.authorRole})`,
    );
  }

  await storageService.deleteGameFiles(deletedGame.id_game);

  res.redirect('/games');
}

async function showEditGame(req, res) {
  const game = await gamesService.getGameById(req.params.gameId);

  if (!game) {
    return res.status(404).send('Juego no encontrado');
  }

  res.render('update_game', {
    title: 'Editar juego',
    game,
  });
}

async function updateGame(req, res) {
  try {
    const gameId = req.params.gameId;
    const currentGame = await gamesService.getGameById(gameId);

    if (!currentGame) {
      return res.status(404).send('Juego no encontrado');
    }

    const entryFile = validateEntryFile(req.body.entry_file);

    if (!entryFile) {
      return res.status(400).send(ENTRY_FILE_ERROR);
    }

    if (req.files?.thumbnail?.[0]) {
      await assertPngFile(req.files.thumbnail[0].path);
    }

    const updatedGame = await gamesService.updateGame(gameId, {
      game_name: req.body.game_name,
      game_description: req.body.game_description,
      entry_file: entryFile,
    });

    try {
      if (req.files?.gameFile?.[0]) {
        await storageService.replaceGameFiles(
          gameId,
          req.files.gameFile[0],
          updatedGame.entry_file,
        );
      }

      if (req.files?.thumbnail?.[0]) {
        await storageService.storeThumbnail(req.files.thumbnail[0], updatedGame.id_game);
      }
    } catch (fileError) {
      // Los archivos fallaron: revierte los metadatos a como estaban
      // antes, para que la DB no diga algo distinto a lo que hay en disco.
      await gamesService
        .updateGame(gameId, {
          game_name: currentGame.game_name,
          game_description: currentGame.game_description,
          entry_file: currentGame.entry_file,
        })
        .catch((rollbackError) => {
          console.error('Error revirtiendo metadatos:', rollbackError);
        });

      throw fileError;
    }

    res.redirect(`/games/game-details/${gameId}`);
  } finally {
    await cleanupUploads(req.files);
  }
}

export default {
  showNewGame,
  createGame,
  showGames,
  playGame,
  showGameDetails,
  deleteGame,
  showEditGame,
  updateGame,
};
