import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import db from "../src/database/pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, "../src/database/schema.sql");

async function main() {

    await db.query(fs.readFileSync(schemaPath, "utf8"));
    console.log("✓ Estructura de la base de datos lista.");

    const { rows } = await db.query("SELECT COUNT(*) FROM users");

    if (Number(rows[0].count) > 0) {
        console.log("✓ Ya existen usuarios: no se crea propietario.");
        return;
    }

    const username = (process.env.OWNER_USER ?? "").trim();
    const password = process.env.OWNER_PASSWORD ?? "";

    if (!username || password.length < 12) {
        throw new Error(
            "La base no tiene usuarios. Define OWNER_USER y OWNER_PASSWORD " +
            "(mínimo 12 caracteres) para crear el propietario inicial."
        );
    }

    const hash = await bcrypt.hash(password, 12);

    await db.query(
        `INSERT INTO users (username, password_hash, role_id)
         VALUES ($1, $2, (SELECT id_role FROM roles WHERE role_name = 'owner'))`,
        [username, hash]
    );

    console.log(`✓ Propietario "${username}" creado.`);
}

try {
    await main();
} catch (error) {
    console.error("Error en bootstrap:", error.message);
    process.exitCode = 1;
} finally {
    await db.end();
}