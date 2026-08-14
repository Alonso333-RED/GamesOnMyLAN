import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const settingsPath = path.join(
    __dirname,
    "settings.json"
);

const settings = JSON.parse(
    await fs.readFile(settingsPath, "utf8")
);

export default settings;