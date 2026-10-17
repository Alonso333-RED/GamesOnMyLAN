import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Los routers importan servicios que usan la base de datos; aquí no hace falta una real.
vi.mock('../../src/database/pool.js', () => ({
  default: { query: vi.fn() },
}));

import homeRouter from '../../src/routes/homeRouter.js';
import authRouter from '../../src/routes/authRouter.js';
import gamesRouter from '../../src/routes/gamesRouter.js';
import usersRouter from '../../src/routes/usersRouter.js';
import favoritesRouter from '../../src/routes/favoritesRouter.js';

// Prefijo con el que app.js monta cada router. Si cambias app.js, cámbialo aquí también.
const mounts = [
  ['/', homeRouter],
  ['/auth', authRouter],
  ['/games', gamesRouter],
  ['/users', usersRouter],
  ['/favorites', favoritesRouter],
];

// Rutas que no son de los routers sino de archivos estáticos
const STATIC_PREFIXES = ['/css/', '/js/', '/img/', '/icons/', '/thumbnails/', '/avatars/'];

// Lista de { method, regex } con todas las rutas registradas
function buildRouteTable() {
  const table = [];

  for (const [prefix, router] of mounts) {
    for (const layer of router.stack) {
      if (!layer.route) continue;

      const fullPath = (prefix + layer.route.path).replace(/\/+/g, '/');
      const pattern = fullPath.replace(/:[A-Za-z]+/g, '[^/]+').replace(/\/$/, '');
      const regex = new RegExp(`^${pattern === '' ? '/' : pattern}$`);

      for (const method of Object.keys(layer.route.methods)) {
        table.push({ method: method.toUpperCase(), regex });
      }
    }
  }

  return table;
}

const routeTable = buildRouteTable();

function routeExists(method, url) {
  const cleanUrl = url.length > 1 ? url.replace(/\/$/, '') : url;
  return routeTable.some((route) => route.method === method && route.regex.test(cleanUrl));
}

// {{algo}} y ${algo} se reemplazan por un valor cualquiera
function fillPlaceholders(url) {
  return url.replace(/\{\{[^}]+\}\}/g, '1').replace(/\$\{[^}]+\}/g, '1');
}

function listFiles(dir, extension) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? listFiles(fullPath, extension) : [fullPath];
    })
    .filter((file) => file.endsWith(extension));
}

describe('enlaces de las vistas (.hbs)', () => {
  const links = [];

  for (const file of listFiles('src/views', '.hbs')) {
    const content = fs.readFileSync(file, 'utf8');

    for (const match of content.matchAll(/\b(href|action)="(\/[^"]*)"/g)) {
      const [, attribute, rawUrl] = match;
      const url = fillPlaceholders(rawUrl);

      if (STATIC_PREFIXES.some((prefix) => url.startsWith(prefix)) || url === '/img/logo.png') {
        continue;
      }

      const [urlPath, query = ''] = url.split('?');
      const overrideMethod = new URLSearchParams(query).get('_method');
      const method = attribute === 'href' ? 'GET' : (overrideMethod ?? 'POST');

      links.push({ file, rawUrl, urlPath, method });
    }
  }

  it('encuentra enlaces para revisar', () => {
    expect(links.length).toBeGreaterThan(10);
  });

  for (const { file, rawUrl, urlPath, method } of links) {
    it(`${path.basename(file)}: ${method} ${rawUrl} existe en algún router`, () => {
      expect(routeExists(method, urlPath)).toBe(true);
    });
  }
});

describe('redirecciones en controladores y middlewares', () => {
  const redirects = [];
  const files = [...listFiles('src/controllers', '.js'), ...listFiles('src/middlewares', '.js')];
  files.push('app.js');

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');

    for (const match of content.matchAll(/redirect\(\s*[`'"](\/[^`'"]*)[`'"]/g)) {
      redirects.push({ file, rawUrl: match[1], urlPath: fillPlaceholders(match[1]).split('?')[0] });
    }
  }

  it('encuentra redirecciones para revisar', () => {
    expect(redirects.length).toBeGreaterThan(5);
  });

  for (const { file, rawUrl, urlPath } of redirects) {
    it(`${path.basename(file)}: redirect a ${rawUrl} existe en algún router`, () => {
      expect(routeExists('GET', urlPath)).toBe(true);
    });
  }
});
