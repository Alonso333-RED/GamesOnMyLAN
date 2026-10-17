import settings from '../../admin/getSettings.js';

export function requireGuestRegister(req, res, next) {
  if (settings.guest_register === false) {
    return res.status(403).send('Registro de invitados deshabilitado por el host');
  }

  next();
}
