import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

import settings from '../admin/getSettings.js';
import { APP_PORT, GAMES_PORT } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

function loadTlsOptions() {
  if (settings.public_mode) {
    return null;
  }

  return {
    key: fs.readFileSync(path.join(projectRoot, 'certs', 'server.key')),
    cert: fs.readFileSync(path.join(projectRoot, 'certs', 'server.crt')),
  };
}

function createServer(tlsOptions, handler) {
  return tlsOptions ? https.createServer(tlsOptions, handler) : http.createServer(handler);
}

// App aparte que solo entrega los archivos de los juegos subidos.
// Corre en otro puerto (otro origen) para que el código de un juego
// no pueda leer la sesión del sitio.
function createGamesApp() {
  const gamesApp = express();

  gamesApp.disable('x-powered-by');
  gamesApp.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Opcional: solo si un juego de Godot con hilos lo pide
    // res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    // res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
  });
  gamesApp.use(express.static(path.join(process.cwd(), 'data', 'games')));

  return gamesApp;
}

function showPortError(error, port, label) {
  if (error.code === 'EADDRINUSE') {
    console.error(`El puerto ${label} ${port} ya está siendo utilizado.`);
  } else {
    console.error(error.message);
  }
}

function showStartupError(error) {
  console.error('\n====================================');
  console.error('ERROR AL CONFIGURAR HTTPS');
  console.error('====================================');

  if (error.code === 'ENOENT') {
    console.error('No se encontraron los certificados HTTPS.');

    console.log(`

            IMPORTANTE:
            Antes de iniciar GamesOnMyLAN debes generar los certificados HTTPS:

                node admin/cert.js

            Esto creará la carpeta "certs" en el directorio raíz
            del proyecto, de no ser asi, muevela a la raiz.

            Si los certificados ya existen pero la IP local cambió,
            elimina la carpeta "certs" y vuelve a ejecutar el script.

            Ademas debes de revisar el archivo .env y cambiar los valores por defecto.
        `);
  } else if (error.code === 'EACCES') {
    console.error('No tienes permisos para acceder a los certificados.');
  } else {
    console.error(error.message);
  }
}

export function startServers(app) {
  try {
    const tlsOptions = loadTlsOptions();

    const appServer = createServer(tlsOptions, app);

    appServer.on('error', (error) => {
      console.error('\n====================================');
      console.error('ERROR AL INICIAR EL SERVIDOR');
      console.error('====================================');
      showPortError(error, APP_PORT, 'de la aplicación');
      process.exit(1);
    });

    appServer.listen(APP_PORT, () => {
      console.log(
        `app_port: ${settings.app_port}\n` +
          `guest_register: ${settings.guest_register}\n` +
          `GamesOnMyLAN listening on port https://localhost:${APP_PORT}/`,
      );
    });

    const gamesServer = createServer(tlsOptions, createGamesApp());

    gamesServer.on('error', (error) => {
      showPortError(error, GAMES_PORT, 'de juegos');
      process.exit(1);
    });

    gamesServer.listen(GAMES_PORT, () => {
      console.log(`Servidor de juegos en https://localhost:${GAMES_PORT}/`);
    });
  } catch (error) {
    showStartupError(error);
    process.exit(1);
  }
}
