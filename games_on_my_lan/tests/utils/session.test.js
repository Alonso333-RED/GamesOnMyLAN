import { describe, it, expect, vi } from 'vitest';
import session from 'express-session';
import { destroyOtherSessions } from '../../src/utils/session.js';

function fakeStore(sessions) {
  return {
    all: vi.fn((cb) => cb(null, sessions)),
    destroy: vi.fn((sid, cb) => cb(null)),
  };
}

describe('destroyOtherSessions', () => {
  it('cierra las demás sesiones del usuario y respeta la actual y las ajenas', async () => {
    const store = fakeStore({
      actual: { user: { id: 7 } },
      otra: { user: { id: 7 } },
      tercera: { user: { id: 7 } },
      ajena: { user: { id: 8 } },
      anonima: {},
    });
    const req = { sessionStore: store, sessionID: 'actual' };

    const closed = await destroyOtherSessions(req, 7);

    expect(closed).toBe(2);
    expect(store.destroy).toHaveBeenCalledTimes(2);
    expect(store.destroy.mock.calls.map(([sid]) => sid).sort()).toEqual(['otra', 'tercera']);
  });

  it('no hace nada si el almacén no sabe listar sesiones', async () => {
    const req = { sessionStore: { destroy: vi.fn() }, sessionID: 'x' };

    expect(await destroyOtherSessions(req, 7)).toBe(0);
    expect(req.sessionStore.destroy).not.toHaveBeenCalled();
  });

  it('no hace nada si el almacén devuelve un arreglo (sin ids)', async () => {
    const store = fakeStore([{ user: { id: 7 } }]);

    expect(await destroyOtherSessions({ sessionStore: store, sessionID: 'x' }, 7)).toBe(0);
    expect(store.destroy).not.toHaveBeenCalled();
  });

  it('propaga el error si el almacén falla (el controlador lo captura)', async () => {
    const store = { all: vi.fn((cb) => cb(new Error('boom'))), destroy: vi.fn() };

    await expect(destroyOtherSessions({ sessionStore: store, sessionID: 'x' }, 7)).rejects.toThrow(
      'boom',
    );
  });

  it('funciona con el MemoryStore real de express-session', async () => {
    const store = new session.MemoryStore();
    const put = (sid, data) =>
      new Promise((resolve, reject) =>
        store.set(sid, { cookie: { maxAge: 60000 }, ...data }, (e) => (e ? reject(e) : resolve())),
      );
    const get = (sid) =>
      new Promise((resolve, reject) => store.get(sid, (e, s) => (e ? reject(e) : resolve(s))));

    await put('actual', { user: { id: 3 } });
    await put('celular', { user: { id: 3 } });
    await put('otro-usuario', { user: { id: 4 } });

    const closed = await destroyOtherSessions({ sessionStore: store, sessionID: 'actual' }, 3);

    expect(closed).toBe(1);
    expect(await get('celular')).toBeFalsy();
    expect(await get('actual')).toBeTruthy();
    expect(await get('otro-usuario')).toBeTruthy();
  });
});
