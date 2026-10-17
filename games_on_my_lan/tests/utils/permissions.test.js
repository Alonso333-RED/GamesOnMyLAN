import { describe, it, expect } from 'vitest';
import { canDeleteGame, canDeleteUser } from '../../src/utils/permissions.js';

describe('canDeleteGame', () => {
  it('permite al autor borrar su propio juego, aunque sea member', () => {
    expect(
      canDeleteGame({
        actorId: 1,
        actorRole: 'member',
        authorId: 1,
        authorRole: 'member',
      }),
    ).toBe(true);
  });

  it('permite a un admin borrar el juego de un member', () => {
    expect(
      canDeleteGame({
        actorId: 2,
        actorRole: 'admin',
        authorId: 1,
        authorRole: 'member',
      }),
    ).toBe(true);
  });

  it('no permite a un admin borrar el juego de otro admin', () => {
    expect(
      canDeleteGame({
        actorId: 2,
        actorRole: 'admin',
        authorId: 1,
        authorRole: 'admin',
      }),
    ).toBe(false);
  });

  it('permite al owner borrar cualquier juego', () => {
    expect(
      canDeleteGame({
        actorId: 3,
        actorRole: 'owner',
        authorId: 1,
        authorRole: 'admin',
      }),
    ).toBe(true);
  });

  it('no permite a un member borrar el juego de otro usuario', () => {
    expect(
      canDeleteGame({
        actorId: 2,
        actorRole: 'member',
        authorId: 1,
        authorRole: 'member',
      }),
    ).toBe(false);
  });

  it('niega el acceso si el rol del actor es desconocido', () => {
    expect(
      canDeleteGame({
        actorId: 2,
        actorRole: 'rol_inventado',
        authorId: 1,
        authorRole: 'member',
      }),
    ).toBe(false);
  });
});

describe('canDeleteUser', () => {
  const cases = [
    ['member se elimina a sí mismo', [1, 'member'], [1, 'member'], true],
    ['admin se elimina a sí mismo', [2, 'admin'], [2, 'admin'], true],
    ['owner NO se elimina a sí mismo', [3, 'owner'], [3, 'owner'], false],
    ['owner elimina a un admin', [3, 'owner'], [2, 'admin'], true],
    ['owner elimina a un member', [3, 'owner'], [1, 'member'], true],
    ['admin elimina a un member', [2, 'admin'], [1, 'member'], true],
    ['admin NO elimina a otro admin', [2, 'admin'], [4, 'admin'], false],
    ['admin NO elimina al owner', [2, 'admin'], [3, 'owner'], false],
    ['member NO elimina a otro member', [1, 'member'], [5, 'member'], false],
    ['member NO elimina a un admin', [1, 'member'], [2, 'admin'], false],
    ['rol desconocido del actor: se niega', [9, 'otro'], [1, 'member'], false],
    ['admin y rol desconocido del objetivo: se niega', [2, 'admin'], [9, 'otro'], false],
  ];

  for (const [description, [actorId, actorRole], [targetId, targetRole], expected] of cases) {
    it(description, () => {
      expect(canDeleteUser({ actorId, actorRole, targetId, targetRole })).toBe(expected);
    });
  }
});
