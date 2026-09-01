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

async function getUserById(userId) {

    const result = await pool.query(
        `
        SELECT 
            users.username,
            roles.role_name,
            users.registered_at
        FROM users
        INNER JOIN roles
            ON users.role_id = roles.id_role
        WHERE users.id_user = $1
        `,
        [userId]
    );


    if (result.rows.length === 0) {
        return null;
    }


    return result.rows[0];

}

async function getAllUsers() {
    const result = await pool.query(
        `
        SELECT 
            users.username,
            roles.role_name,
            users.registered_at
        FROM users
        INNER JOIN roles
            ON users.role_id = roles.id_role
        `
    );

    return result.rows;
}

export default {
    registerUser,
    getUserById,
    getAllUsers
};