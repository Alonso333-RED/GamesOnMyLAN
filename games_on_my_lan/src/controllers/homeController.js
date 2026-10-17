import gamesService from '../services/gamesService.js';
import usersService from '../services/usersService.js';

async function showHome(req, res) {
  let stats = null;

  // Si las estadísticas fallan, la portada se muestra igual, sin ellas
  try {
    const [games, users] = await Promise.all([
      gamesService.getAllGames(),
      usersService.getAllUsers(),
    ]);

    stats = {
      totalGames: games.length,
      totalUsers: users.length,
    };
  } catch (error) {
    console.error('No se pudieron cargar las estadísticas de la portada:', error);
  }

  res.render('index', {
    title: 'GamesOnMyLan',
    stats,
  });
}

export default {
  showHome,
};
