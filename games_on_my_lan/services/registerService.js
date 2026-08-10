import pool from "../database/pool.js";
import bcrypt from "bcryptjs";

async function registerUser(username, password) {

    //receive password in plain text and hash it
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await pool.query(
        `
        INSERT INTO users (username, password_hash, role_id)
        VALUES ($1, $2, 3)
        RETURNING id_user
        `,
        [username, hashedPassword]
    );

    return result.rows[0].id_user;
}

export default {
    registerUser
};