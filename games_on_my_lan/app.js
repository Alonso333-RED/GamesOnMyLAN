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
import profileRouter from "./routes/profileRouter.js";
import gamesRouter from "./routes/gamesRouter.js";
import registerRouter from "./routes/registerRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = settings.app_port || 3000;

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
app.use(methodOverride("_method"));

app.use(session({
    secret: "0!nC51q9Uz5K5rrz..Zn2JfyLvBRd9gAw)A4TBz>Q2m]mN^4.+:^y052ZA#%z9%?p",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000,
        secure: true
    }
}));

app.use((req, res, next) => {

    res.locals.user = req.session.user;

    next();

});

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Vistas
app.get("/", (req, res) => {

    res.render("index", {
        title: "GamesOnMyLan"
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
app.use(profileRouter);
app.use(authRouter);
app.use("/games", gamesRouter);
app.use(registerRouter);

// datos
app.use(
    "/thumbnails",
    express.static(
        path.join(process.cwd(), "data", "thumbnails")
    )
);

app.use(
    "/game-files",
    express.static(
        path.join(process.cwd(), "data", "games")
    )
);

// Inicio servidor
try {

    const server = https.createServer(
        {
            key: fs.readFileSync(
                path.join(__dirname, "certs", "server.key")
            ),

            cert: fs.readFileSync(
                path.join(__dirname, "certs", "server.crt")
            )
        },

        app
    );

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

                node admin/generate_cert.js

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