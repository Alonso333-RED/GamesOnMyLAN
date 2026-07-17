import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";

import authRouter from "./routes/authRouter.js";
import profileRouter from "./routes/profileRouter.js";

const app = express();
const PORT = 3000;

// Configuración de rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares globales
app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(session({

    secret: "0!nC51q9Uz5K5rrz..Zn2JfyLvBRd9gAw)A4TBz>Q2m]mN^4.+:^y052ZA#%z9%?p",

    resave: false,

    saveUninitialized: false,

    cookie: {
        maxAge: 3600000
    }

}));

// Archivos públicos
app.use(express.static(
    path.join(__dirname, "public")
));

// Rutas de páginas
app.get("/index", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );

});

app.get("/login", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "login.html")
    );

});

app.get("/profile", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }


    res.sendFile(
        path.join(__dirname, "public", "profile.html")
    );

});

// Rutas API
app.use("/api", profileRouter);
app.use("/auth", authRouter);

// Inicio servidor
app.listen(PORT, () => {

    console.log(
        `GamesOnMyLan listening on port ${PORT}`
    );

});