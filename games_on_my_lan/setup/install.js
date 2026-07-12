import bcrypt from "bcryptjs";
import readline from "readline";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import db from "../database/connection.js";

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

        console.log(`
====================================
      GamesOnMyLan Installer
====================================
`);

        console.log("[1/3] Creando tablas...");

        const schemaPath = path.join(
            __dirname,
            "../database/schema.sql"
        );

        const schema = fs.readFileSync(
            schemaPath,
            "utf8"
        );

        await db.query(schema);

        console.log("✓ Base de datos preparada.");

        const result = await db.query(
            "SELECT COUNT(*) FROM users;"
        );

        if (Number(result.rows[0].count) > 0) {
            console.log("\nYa existe un usuario.");
            console.log("La instalación ya fue realizada.");
            return;
        }

        console.log("\n[2/3] Crear propietario\n");

        const username = await ask("Usuario: ");
        const password = await ask("Contraseña: ");

        const hash = await bcrypt.hash(password, 12);

        await db.query(
            `
            INSERT INTO users
            (
                username,
                password_hash,
                role_id
            )
            VALUES
            (
                $1,
                $2,
                (
                    SELECT id
                    FROM roles
                    WHERE role_name = 'owner'
                )
            );
            `,
            [
                username,
                hash
            ]
        );

        console.log("\n✓ Owner creado correctamente.");

        console.log(`
[3/3] Instalación completada.

Ya puedes iniciar el servidor.
`);

    } catch (error) {

        console.error("\nError:");
        console.error(error.message);

    } finally {

        rl.close();
        await db.end();

    }

}

main();