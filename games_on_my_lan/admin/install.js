import bcrypt from "bcryptjs";
import readline from "readline";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ====================================
// CREAR SETTINGS ANTES DE TODO
// ====================================

const settingsPath = path.join(
    __dirname,
    "settings.json"
);

if (!fs.existsSync(settingsPath)) {

    const settings = {
        db_host: "localhost",
        db_port: 5432,
        db_user: "goml",
        db_password: "goml_psw",
        db_database: "goml_db",
        app_port: 3000,
        guest_register: true
    };

    fs.writeFileSync(
        settingsPath,
        JSON.stringify(settings, null, 2)
    );

}


// ====================================
// DESPUÉS DE CREAR SETTINGS
// ====================================

const { default: db } = await import(
    "../database/pool.js"
);


// ====================================
// RESTO DEL INSTALADOR
// ====================================

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
                    SELECT id_role
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
    IMPORTANTE:
    Antes de iniciar GamesOnMyLAN debes generar los certificados HTTPS:

        node admin/generate_cert.js

    Esto creará la carpeta "certs" en el directorio raíz
    del proyecto, de no ser asi, muevela a la raiz.

    Si los certificados ya existen pero la IP local cambió,
    elimina la carpeta "certs" y vuelve a ejecutar el script.

    Ademas debes de revisar settings.json y cambiar los valores por defecto.
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