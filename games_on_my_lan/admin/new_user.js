import bcrypt from "bcryptjs";
import readline from "readline";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import db from "../database/pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}

async function main() {

    try {
        const username = await ask("Usuario: ");
        const password = await ask("Contraseña: ");
        const role = await ask("Rol (admin/member): ");

        const hash = await bcrypt.hash(password, 12);

        await db.query(
            "INSERT INTO users (username, password_hash, role_id) VALUES ($1, $2, (SELECT id FROM roles WHERE role_name = $3))",
            [username, hash, role]
        );

        console.log(`Usuario ${username} creado con éxito.`);
    }
    catch (error) {
        console.error("Error al crear el usuario:", error);
    }
    finally {
        rl.close();
        await db.end();
    }
}

main();