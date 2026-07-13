import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "alonso",
    password: "1289",
    database: "gamesonmylan"
});

export default pool;