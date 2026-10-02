import crypto from "crypto";
import fs from "fs";
import path from "path";

import settings from "../../admin/getSettings.js";

const secretPath = path.join(process.cwd(), "data", "session_secret");

export function getSessionSecret() {

    if (settings.session_secret) {
        return settings.session_secret;
    }

    try {
        const saved = fs.readFileSync(secretPath, "utf8").trim();
        if (saved) {
            return saved;
        }
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }

    const secret = crypto.randomBytes(64).toString("hex");

    fs.mkdirSync(path.dirname(secretPath), { recursive: true });
    fs.writeFileSync(secretPath, secret, { mode: 0o600 });

    return secret;
}