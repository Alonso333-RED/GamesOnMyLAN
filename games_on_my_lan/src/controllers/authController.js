import authService from '../services/authService.js';
import { regenerateSession, saveSession, endSession } from '../utils/session.js';

async function login(req, res) {
  const { username, password } = req.body;

  const user = await authService.login(username, password);

  if (!user) {
    return res.redirect('/auth/login?error=1');
  }

  await regenerateSession(req);
  req.session.user = {
    id: user.id_user,
  };
  await saveSession(req);

  res.redirect('/users/profile');
}

async function logout(req, res) {
  await endSession(req, res);

  res.redirect('/auth/login');
}

function showLogin(req, res) {
  res.render('login', {
    title: 'Iniciar sesión',
    error: req.query.error === '1',
  });
}

export default {
  login,
  logout,
  showLogin,
};
