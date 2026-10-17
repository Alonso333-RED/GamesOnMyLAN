import settings from '../admin/getSettings.js';

export const APP_PORT = settings.app_port || 3000;
export const GAMES_PORT = settings.games_port || APP_PORT + 1;

// Los juegos se sirven desde otro origen que el sitio (otro puerto o GAMES_ORIGIN)
export function getGamesOrigin(req) {
  return settings.games_origin || `https://${req.hostname}:${GAMES_PORT}`;
}
