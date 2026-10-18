import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { passwordChangeLimiter } from '../../src/middlewares/rateLimit.js';

let server;
let baseUrl;

beforeAll(async () => {
  const app = express();

  // Simula la sesión: el usuario y el resultado vienen en la URL
  app.post('/:userId/:outcome', (req, res, next) => {
    req.session = { user: { id: Number(req.params.userId) } };
    next();
  });
  app.post('/:userId/:outcome', passwordChangeLimiter, (req, res) => {
    if (req.params.outcome === 'wrong') {
      res.locals.failedPasswordAttempt = true; // clave actual incorrecta
      return res.status(400).send('mal');
    }
    if (req.params.outcome === 'invalid') return res.status(400).send('validación');
    res.redirect('/ok');
  });

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

const post = (userId, outcome) =>
  fetch(`${baseUrl}/${userId}/${outcome}`, { method: 'POST', redirect: 'manual' });

describe('passwordChangeLimiter', () => {
  it('bloquea al 6.º intento con la contraseña actual incorrecta con 429', async () => {
    for (let i = 0; i < 5; i++) {
      expect((await post(1, 'wrong')).status).toBe(400);
    }
    expect((await post(1, 'wrong')).status).toBe(429);
  });

  it('no afecta a otro usuario', async () => {
    expect((await post(2, 'wrong')).status).toBe(400);
  });

  it('los errores de validación no consumen intentos', async () => {
    for (let i = 0; i < 12; i++) {
      expect((await post(3, 'invalid')).status).toBe(400);
    }
    expect((await post(3, 'wrong')).status).toBe(400);
  });

  it('los cambios exitosos no consumen intentos', async () => {
    for (let i = 0; i < 10; i++) {
      expect((await post(4, 'ok')).status).toBe(302);
    }
    expect((await post(4, 'wrong')).status).toBe(400);
  });
});
