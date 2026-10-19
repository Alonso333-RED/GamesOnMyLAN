import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

vi.mock('../../src/database/pool.js', () => ({
  default: { query: vi.fn() },
}));

import pool from '../../src/database/pool.js';
import usersService from '../../src/services/usersService.js';

// Costo bajo solo para generar la contraseña de prueba rápido
const oldHash = bcrypt.hashSync('vieja-clave', 4);

beforeEach(() => {
  pool.query.mockReset();
});

describe('usersService.changePassword', () => {
  it("devuelve 'not_found' si el usuario no existe y no escribe nada", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await usersService.changePassword(1, 'vieja-clave', 'nueva-clave-123');

    expect(result).toBe('not_found');
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("devuelve 'wrong_password' si la actual es incorrecta y no hace UPDATE", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ password_hash: oldHash }] });

    const result = await usersService.changePassword(1, 'equivocada', 'nueva-clave-123');

    expect(result).toBe('wrong_password');
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("guarda un hash nuevo válido y devuelve 'ok'", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ password_hash: oldHash }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id_user: 1 }] });

    const result = await usersService.changePassword(1, 'vieja-clave', 'nueva-clave-123');

    expect(result).toBe('ok');

    const [sql, params] = pool.query.mock.calls[1];
    const [newHash, userId, previousHash] = params;

    expect(sql).toMatch(/AND\s+password_hash\s*=\s*\$3/);
    expect(userId).toBe(1);
    expect(previousHash).toBe(oldHash);
    expect(newHash).not.toBe(oldHash);
    expect(newHash).not.toContain('nueva-clave-123');
    expect(await bcrypt.compare('nueva-clave-123', newHash)).toBe(true);
    expect(await bcrypt.compare('vieja-clave', newHash)).toBe(false);
  });

  it("devuelve 'conflict' si la contraseña cambió entre la lectura y la escritura", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ password_hash: oldHash }] })
      .mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const result = await usersService.changePassword(1, 'vieja-clave', 'nueva-clave-123');

    expect(result).toBe('conflict');
  });
});
