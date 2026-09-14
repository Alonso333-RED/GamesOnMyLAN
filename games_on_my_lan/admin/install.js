import bcrypt from "bcryptjs";
import readline from "readline";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ====================================
// RUTAS
// ====================================

const settingsPath = path.join(
    __dirname,
    "settings.json"
);

const schemaPath = path.join(
    __dirname,
    "../database/schema.sql"
);


// ====================================
// READLINE
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


// ====================================
// UTILIDADES
// ====================================

function askDefault(question, defaultValue) {
    return new Promise(resolve => {
        rl.question(
            `${question} [${defaultValue}]: `,
            answer => {
                const value = answer.trim();

                resolve(
                    value === ""
                        ? defaultValue
                        : value
                );
            }
        );
    });
}

function askBoolean(question, defaultValue = true) {
    const defaultText = defaultValue ? "S/n" : "s/N";

    return new Promise(resolve => {
        rl.question(
            `${question} [${defaultText}]: `,
            answer => {
                const value = answer.trim().toLowerCase();

                if (value === "") {
                    resolve(defaultValue);
                    return;
                }

                if (
                    value === "s" ||
                    value === "si" ||
                    value === "sí" ||
                    value === "y" ||
                    value === "yes"
                ) {
                    resolve(true);
                    return;
                }

                if (
                    value === "n" ||
                    value === "no"
                ) {
                    resolve(false);
                    return;
                }

                console.log(
                    "Respuesta no válida. Se utilizará el valor por defecto."
                );

                resolve(defaultValue);
            }
        );
    });
}

async function askInstallationType() {

    console.log(`
====================================
       Tipo de instalación
====================================

[1] Instalación nueva
[2] Restauración de una instalación existente
`);

    while (true) {

        const option = (
            await ask("Selecciona una opción [1/2]: ")
        ).trim();

        if (option === "1") {
            return "new";
        }

        if (option === "2") {
            return "restore";
        }

        console.log("\nOpción no válida.\n");
    }
}


// ====================================
// CREAR SETTINGS
// ====================================

async function createSettings() {

    console.log(`
====================================
       Configuración de GOML
====================================

Introduce los datos de conexión a PostgreSQL.
Presiona ENTER para utilizar el valor indicado entre corchetes.
`);

    const db_host = await askDefault(
        "Host de PostgreSQL",
        "localhost"
    );

    const db_port = await askDefault(
        "Puerto de PostgreSQL",
        5432
    );

    const db_user = await askDefault(
        "Usuario de PostgreSQL",
        "goml"
    );

    const db_password = await ask(
        "Contraseña de PostgreSQL: "
    );

    const db_database = await askDefault(
        "Base de datos",
        "goml_db"
    );

    console.log("");

    const app_port = await askDefault(
        "Puerto de GamesOnMyLAN",
        3000
    );

    const guest_register = await askBoolean(
        "¿Permitir registro de invitados?",
        true
    );

    const settings = {

        db_host,

        db_port: Number(db_port),

        db_user,

        db_password,

        db_database,

        app_port: Number(app_port),

        guest_register,

        session_secret:
            crypto.randomBytes(64).toString("hex")
    };

    fs.writeFileSync(
        settingsPath,
        JSON.stringify(
            settings,
            null,
            2
        ),
        "utf8"
    );

    console.log(
        "\n✓ settings.json creado correctamente."
    );

    return settings;
}


// ====================================
// CARGAR SETTINGS
// ====================================

function loadSettings() {

    try {

        const data = fs.readFileSync(
            settingsPath,
            "utf8"
        );

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "\nNo se pudo leer settings.json."
        );

        throw error;
    }
}


// ====================================
// CONFIGURACIÓN
// ====================================

async function configureSettings() {

    if (!fs.existsSync(settingsPath)) {

        return await createSettings();

    }

    console.log(`
====================================
       settings.json encontrado
====================================

Ya existe un archivo settings.json.
`);

    console.log("[1] Usar configuración existente");
    console.log("[2] Reconfigurar");
    console.log("[3] Cancelar");

    while (true) {

        const option = (
            await ask("\nSelecciona una opción [1/2/3]: ")
        ).trim();

        if (option === "1") {

            console.log(
                "\n✓ Se utilizará la configuración existente."
            );

            return loadSettings();
        }

        if (option === "2") {

            console.log(
                "\nSe creará una nueva configuración."
            );

            /*
             * Si se reconfigura, NO generamos otro
             * session_secret si ya existe.
             */

            const oldSettings = loadSettings();

            const settings = await createSettings();

            settings.session_secret =
                oldSettings.session_secret;

            fs.writeFileSync(
                settingsPath,
                JSON.stringify(
                    settings,
                    null,
                    2
                ),
                "utf8"
            );

            console.log(
                "✓ Session secret existente conservado."
            );

            return settings;
        }

        if (option === "3") {

            console.log(
                "\nInstalación cancelada."
            );

            process.exit(0);
        }

        console.log(
            "\nOpción no válida."
        );
    }
}


// ====================================
// CONECTAR A POSTGRESQL
// ====================================

async function connectDatabase() {

    /*
     * pool.js importa settings.json,
     * por lo tanto settings.json debe existir
     * antes de importar este módulo.
     */

    const { default: db } = await import(
        "../database/pool.js"
    );

    try {

        const result = await db.query(
            "SELECT current_database();"
        );

        console.log(
            `✓ Conectado a PostgreSQL.`
        );

        console.log(
            `  Base de datos: ${result.rows[0].current_database}`
        );

        return db;

    } catch (error) {

        console.error(`
====================================
     Error de conexión
====================================

No se pudo conectar a PostgreSQL.

Comprueba:

- Que PostgreSQL esté instalado.
- Que PostgreSQL esté ejecutándose.
- Que db_host sea correcto.
- Que db_port sea correcto.
- Que db_user sea correcto.
- Que db_password sea correcto.
- Que db_database exista.

Error:
${error.message}
`);

        throw error;
    }
}


// ====================================
// INSTALACIÓN NUEVA
// ====================================

async function newInstallation(db) {

    console.log(`
====================================
       Instalación nueva
====================================
`);

    console.log("[1/2] Creando estructura de base de datos...");

    if (!fs.existsSync(schemaPath)) {

        throw new Error(
            `No se encontró schema.sql en:\n${schemaPath}`
        );
    }

    const schema = fs.readFileSync(
        schemaPath,
        "utf8"
    );

    await db.query(schema);

    console.log(
        "✓ Base de datos preparada."
    );


    // ====================================
    // COMPROBAR USUARIOS
    // ====================================

    const result = await db.query(
        "SELECT COUNT(*) FROM users;"
    );

    if (Number(result.rows[0].count) > 0) {

        console.log(`
Ya existen usuarios en la base de datos.

No se creará otro usuario owner.

La instalación continuará sin crear un usuario inicial.
`);

        return;
    }


    // ====================================
    // CREAR OWNER
    // ====================================

    console.log(`
[2/2] Crear propietario inicial
`);

    const username = await ask(
        "Usuario: "
    );

    if (!username.trim()) {

        throw new Error(
            "El nombre de usuario no puede estar vacío."
        );
    }

    const password = await ask(
        "Contraseña: "
    );

    if (!password) {

        throw new Error(
            "La contraseña no puede estar vacía."
        );
    }

    const hash = await bcrypt.hash(
        password,
        12
    );

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
            username.trim(),
            hash
        ]
    );

    console.log(
        "\n✓ Owner creado correctamente."
    );
}


// ====================================
// RESTAURACIÓN
// ====================================

async function restoreInstallation() {

    console.log(`
====================================
       Restauración
====================================

GamesOnMyLAN no modificará la estructura
ni los datos de la base de datos.

Debes restaurar manualmente el respaldo
de PostgreSQL antes de iniciar GOML.

Pasos recomendados:

1. Asegúrate de que PostgreSQL esté instalado
   y funcionando.

2. Comprueba que la base de datos indicada
   en settings.json exista.

3. Restaura el respaldo de PostgreSQL
   sobre esa base de datos.

4. Comprueba que la restauración haya
   finalizado correctamente.

5. Inicia GamesOnMyLAN.

La configuración actual es:

    Host:      ${loadSettings().db_host}
    Puerto:    ${loadSettings().db_port}
    Usuario:   ${loadSettings().db_user}
    Base datos:${loadSettings().db_database}

IMPORTANTE:

NO ejecutes schema.sql.

El respaldo ya contiene la estructura y los
datos de la instalación anterior.

Consulta el manual de administración de
GamesOnMyLAN para las instrucciones completas
de backup y restauración.

====================================
     Restauración preparada
====================================
`);

    await ask(
        "\nPresiona ENTER para finalizar..."
    );
}


// ====================================
// FINAL
// ====================================

function showFinalMessage() {

    console.log(`
====================================
     Instalación completada
====================================

Antes de iniciar GamesOnMyLAN debes generar
los certificados HTTPS:

    node admin/cert.js

Esto creará la carpeta "certs" en el
directorio raíz del proyecto.

Si los certificados ya existen pero la IP
local cambió, elimina la carpeta "certs"
y vuelve a ejecutar el script.

También puedes revisar settings.json si
necesitas modificar alguna configuración.

====================================
`);
}


// ====================================
// MAIN
// ====================================

async function main() {

    let db = null;

    try {

        console.log(`
====================================
      GamesOnMyLAN Installer
====================================
`);


        // ====================================
        // 1. SETTINGS
        // ====================================

        console.log(
            "[1/4] Configurando GamesOnMyLAN..."
        );

        await configureSettings();


        // ====================================
        // 2. TIPO DE INSTALACIÓN
        // ====================================

        console.log(
            "\n[2/4] Seleccionando tipo de instalación..."
        );

        const installationType =
            await askInstallationType();


        // ====================================
        // RESTAURACIÓN
        // ====================================

        if (installationType === "restore") {

            console.log(
                "\n[3/4] Preparando restauración..."
            );

            await restoreInstallation();

            return;
        }


        // ====================================
        // CONEXIÓN
        // ====================================

        console.log(
            "\n[3/4] Comprobando PostgreSQL..."
        );

        db = await connectDatabase();


        // ====================================
        // INSTALACIÓN NUEVA
        // ====================================

        console.log(
            "\n[4/4] Instalando GamesOnMyLAN..."
        );

        await newInstallation(db);


        // ====================================
        // FINAL
        // ====================================

        showFinalMessage();

    } catch (error) {

        console.error(`
====================================
              ERROR
====================================

${error.message}
`);

    } finally {

        rl.close();

        if (db) {

            await db.end();

        }
    }
}


main();
