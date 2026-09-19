import express from "express";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import { engine } from "express-handlebars";
import fs from "fs";
import https from "https";

import settings from "./admin/getSettings.js";

import authRouter from "./routes/authRouter.js";
import gamesRouter from "./routes/gamesRouter.js";
import userRouter from "./routes/userRouter.js";

import gamesService from "./services/gamesService.js";
import userService from "./services/userService.js";

import { csrfProtection } from "./middlewares/csrf.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = settings.app_port || 3000;
const GAMES_PORT = settings.games_port || PORT + 1;

// Engine
app.engine(
    "hbs",
    engine({
        extname: ".hbs",
        defaultLayout: "main"
    })
);

app.set("view engine", "hbs");
app.set(
    "views",
    path.join(__dirname, "views")
);

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(csrfProtection);
app.use(methodOverride("_method"));

app.use(session({
    secret: settings.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000,
        secure: true,
        httpOnly: true,
        sameSite: "strict"
    }
}));

app.use((req, res, next) => {

    res.locals.user = req.session.user;
    res.locals.gamesOrigin = `https://${req.hostname}:${GAMES_PORT}`;

    next();

});

// Archivos estáticos

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
});

app.use(express.static(path.join(__dirname, "public")));

// Vistas
app.get("/", async (req, res) => {

    let stats = null;

    try {

        const [games, users] = await Promise.all([
            gamesService.getAllGames(),
            userService.getAllUsers()
        ]);

        stats = {
            totalGames: games.length,
            totalUsers: users.length
        };

    } catch (error) {
        console.error("No se pudieron cargar las estadísticas de la portada:", error);
    }

    res.render("index", {
        title: "GamesOnMyLan",
        stats
    });

});


app.get("/games/new", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    res.render("new_game", {
        title: "Nuevo Juego"
    });

});

// Routers
app.use(authRouter);
app.use("/games", gamesRouter);
app.use(userRouter);

// datos
app.use(
    "/thumbnails",
    express.static(
        path.join(process.cwd(), "data", "thumbnails")
    )
);

app.use((err, req, res, next) => {

    if (res.headersSent) {
        return next(err);
    }

    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).send("El archivo es demasiado grande");
    }

    if (err.name === "MulterError" || err.status === 400) {
        return res.status(400).send(err.message);
    }

    console.error(err);
    res.status(500).send("Error procesando la solicitud");
});

// Inicio servidor
try {

    const tlsOptions = {
    key: fs.readFileSync(path.join(__dirname, "certs", "server.key")),
    cert: fs.readFileSync(path.join(__dirname, "certs", "server.crt"))
    };

    const server = https.createServer(tlsOptions, app);

    server.on("error", (error) => {

        console.error("\n====================================");
        console.error("ERROR AL INICIAR EL SERVIDOR");
        console.error("====================================");

        if (error.code === "EADDRINUSE") {

            console.error(
                `El puerto ${PORT} ya está siendo utilizado.`
            );

        } else {

            console.error(error.message);

        }

        process.exit(1);

    });

    server.listen(PORT, () => {

        console.log(
            `app_port: ${settings.app_port}\n` +
            `guest_register: ${settings.guest_register}\n` +
            `GamesOnMyLAN listening on port https://localhost:${PORT}/`
        );

    });

    const gamesApp = express();

    gamesApp.disable("x-powered-by");
    gamesApp.use((req, res, next) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        // Opcional: solo si un juego de Godot con hilos lo pide
        // res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        // res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        next();
    });
    gamesApp.use(express.static(path.join(process.cwd(), "data", "games")));

    const gamesServer = https.createServer(tlsOptions, gamesApp);

    gamesServer.on("error", (error) => {
        console.error(
            error.code === "EADDRINUSE"
                ? `El puerto de juegos ${GAMES_PORT} ya está siendo utilizado.`
                : error.message
        );
        process.exit(1);
    });

    gamesServer.listen(GAMES_PORT, () => {
        console.log(`Servidor de juegos en https://localhost:${GAMES_PORT}/`);
    });

} catch (error) {

    console.error("\n====================================");
    console.error("ERROR AL CONFIGURAR HTTPS");
    console.error("====================================");

    if (error.code === "ENOENT") {

        console.error(
            "No se encontraron los certificados HTTPS."
        );

        console.log(`

            IMPORTANTE:
            Antes de iniciar GamesOnMyLAN debes generar los certificados HTTPS:

                node admin/cert.js

            Esto creará la carpeta "certs" en el directorio raíz
            del proyecto, de no ser asi, muevela a la raiz.

            Si los certificados ya existen pero la IP local cambió,
            elimina la carpeta "certs" y vuelve a ejecutar el script.

            Ademas debes de revisar admin/settings.json y cambiar los valores por defecto.
        `);

    } else if (error.code === "EACCES") {

        console.error(
            "No tienes permisos para acceder a los certificados."
        );

    } else {

        console.error(error.message);

    }

    process.exit(1);

}