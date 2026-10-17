import pg from 'pg';
import settings from '../../admin/getSettings.js';

const { Pool } = pg;

const pool = new Pool({
  host: settings.db_host,
  port: settings.db_port,
  user: settings.db_user,
  password: settings.db_password,
  database: settings.db_database,
});

pool.on('error', (error) => {
  console.error('Conexión inactiva de la BD perdida:', error.message);
});

export default pool;
