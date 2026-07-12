import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import testRoute from "./routes/test.js";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/test", testRoute);

app.listen(PORT, () => {
    console.log(`GamesOnMyLan funcionando en puerto ${PORT}`);
});