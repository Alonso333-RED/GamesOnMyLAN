import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "goml",
    password: "goml_psw",
    database: "goml_db",
});

export default pool;