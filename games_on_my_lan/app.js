import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import { engine } from "express-handlebars";
import fs from "fs";
import https from "https";

import authRouter from "./routes/authRouter.js";
import profileRouter from "./routes/profileRouter.js";
import gamesRouter from "./routes/gamesRouter.js";
import registerRouter from "./routes/registerRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

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
        "data/thumbnails"
    )
);

app.use(
    "/game-files",
    express.static(
        path.join(process.cwd(), "data", "games")
    )
);

// Inicio servidor
https.createServer(
    {
        key: fs.readFileSync(
            "certs/server.key"
        ),

        cert: fs.readFileSync(
            "certs/server.crt"
        )
    },

    app

).listen(PORT, () => {

    console.log(
        `GamesOnMyLan listening on https://localhost:${PORT}`
    );

});