import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/services/usersService.js', () => ({
  default: { changePassword: vi.fn() },
}));
vi.mock('../../src/services/gamesService.js', () => ({ default: {} }));
vi.mock('../../src/services/storageService.js', () => ({ default: {} }));
vi.mock('../../src/utils/session.js', () => ({
  regenerateSession: vi.fn().mockResolvedValue(undefined),
  saveSession: vi.fn().mockResolvedValue(undefined),
  endSession: vi.fn().mockResolvedValue(undefined),
  destroyOtherSessions: vi.fn().mockResolvedValue(0),
}));

import usersService from '../../src/services/usersService.js';
import {
  regenerateSession,
  saveSession,
  endSession,
  destroyOtherSessions,
} from '../../src/utils/session.js';
import usersController from '../../src/controllers/usersController.js';

function mockRes() {
  const res = { locals: {} };
  res.status = vi.fn().mockReturnValue(res);
  res.render = vi.fn().mockReturnValue(res);
  res.redirect = vi.fn().mockReturnValue(res);
  return res;
}

function mockReq(body, session = { user: { id: 5, username: 'ana' } }) {
  return { body, session, query: {} };
}

const valid = {
  currentPassword: 'vieja-clave',
  newPassword: 'nueva-clave-123',
  confirmPassword: 'nueva-clave-123',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('showChangePassword', () => {
  it('muestra el formulario, con mensaje de éxito solo si ?ok=1', () => {
    const res = mockRes();
    usersController.showChangePassword({ query: { ok: '1' } }, res);
    expect(res.render).toHaveBeenCalledWith('change_password', {
      title: 'Cambiar contraseña',
      success: true,
    });

    const res2 = mockRes();
    usersController.showChangePassword({ query: { ok: ['1', '2'] } }, res2);
    expect(res2.render.mock.calls[0][1].success).toBe(false);
  });
});

describe('changePassword', () => {
  it('con datos inválidos responde 400 sin tocar la base', async () => {
    const res = mockRes();

    await usersController.changePassword(
      mockReq({ ...valid, confirmPassword: 'distinta-123' }),
      res,
    );

    expect(usersService.changePassword).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render.mock.calls[0][0]).toBe('change_password');
    expect(res.render.mock.calls[0][1].error).toMatch(/no coinciden/);
    expect(res.locals.failedPasswordAttempt).toBeUndefined();
  });

  it('nunca devuelve las contraseñas escritas a la vista', async () => {
    const res = mockRes();

    await usersController.changePassword(mockReq({ ...valid, confirmPassword: 'otra-123' }), res);

    const locals = JSON.stringify(res.render.mock.calls[0][1]);
    expect(locals).not.toContain('vieja-clave');
    expect(locals).not.toContain('nueva-clave-123');
  });

  it('contraseña actual incorrecta: 400 y no se toca la sesión', async () => {
    usersService.changePassword.mockResolvedValue('wrong_password');
    const res = mockRes();

    await usersController.changePassword(mockReq(valid), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render.mock.calls[0][1].error).toMatch(/actual no es correcta/);
    expect(res.locals.failedPasswordAttempt).toBe(true);
    expect(regenerateSession).not.toHaveBeenCalled();
    expect(destroyOtherSessions).not.toHaveBeenCalled();
  });

  it('conflicto concurrente: 409', async () => {
    usersService.changePassword.mockResolvedValue('conflict');
    const res = mockRes();

    await usersController.changePassword(mockReq(valid), res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(regenerateSession).not.toHaveBeenCalled();
  });

  it('cuenta inexistente: cierra la sesión huérfana y manda al login', async () => {
    usersService.changePassword.mockResolvedValue('not_found');
    const res = mockRes();

    await usersController.changePassword(mockReq(valid), res);

    expect(endSession).toHaveBeenCalledOnce();
    expect(res.redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('éxito: renueva la sesión conservando al usuario, cierra las otras y redirige', async () => {
    usersService.changePassword.mockResolvedValue('ok');
    const sessionUser = { id: 5, username: 'ana' };
    const req = mockReq(valid, { user: sessionUser });
    const res = mockRes();

    // regenerate vacía la sesión, como hace express-session
    regenerateSession.mockImplementationOnce(async () => {
      req.session = {};
    });

    await usersController.changePassword(req, res);

    expect(usersService.changePassword).toHaveBeenCalledWith(5, 'vieja-clave', 'nueva-clave-123');
    expect(regenerateSession).toHaveBeenCalledOnce();
    expect(req.session.user).toEqual(sessionUser);
    expect(saveSession).toHaveBeenCalledOnce();
    expect(destroyOtherSessions).toHaveBeenCalledWith(req, 5);
    expect(res.redirect).toHaveBeenCalledWith('/users/password?ok=1');
  });

  it('éxito aunque falle el cierre de otras sesiones', async () => {
    usersService.changePassword.mockResolvedValue('ok');
    destroyOtherSessions.mockRejectedValueOnce(new Error('store caído'));
    const res = mockRes();

    await usersController.changePassword(mockReq(valid), res);

    expect(res.redirect).toHaveBeenCalledWith('/users/password?ok=1');
  });

  it('no registra contraseñas en el log', async () => {
    usersService.changePassword.mockResolvedValue('ok');

    await usersController.changePassword(mockReq(valid), mockRes());

    const logged = console.warn.mock.calls.flat().join(' ');
    expect(logged).toMatch(/cambió su contraseña/);
    expect(logged).not.toContain('vieja-clave');
    expect(logged).not.toContain('nueva-clave-123');
  });
});
