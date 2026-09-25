import pg from "pg";
import settings from "../../admin/getSettings.js";

const { Pool } = pg;

const pool = new Pool({
    host: settings.db_host,
    port: settings.db_port,
    user: settings.db_user,
    password: settings.db_password,
    database: settings.db_database,
});

// Si Postgres se reinicia o se corta la conexión, las conexiones inactivas del
// pool emiten "error". Sin este listener, Node lo trata como excepción no
// capturada y cierra todo el servidor. El pool abre conexiones nuevas solo.
pool.on("error", (error) => {
    console.error("Conexión inactiva de la BD perdida:", error.message);
});

export default pool;