import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";

import authRouter from "./routes/authRouter.js";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "0!nC51q9Uz5Krrz..Zn2JfyLvBRd9gAw)A4TBz>Q2m]mN^4.+:^y052ZA#%z9%?p",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000
    }
}));

app.use(express.static(path.join(__dirname, "public")));

app.get("/index", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.use("/auth", authRouter);

app.listen(PORT, () => {
    console.log(`GamesOnMyLan listening on port ${PORT}`);
});