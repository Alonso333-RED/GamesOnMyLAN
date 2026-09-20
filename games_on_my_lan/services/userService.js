import pool from "../database/pool.js";
import bcrypt from "bcryptjs";

async function registerUser(username, password) {

    //receive password in plain text and hash it
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await pool.query(
        `
        INSERT INTO users (username, password_hash, role_id)
        VALUES (
            $1,
            $2,
            (SELECT id_role FROM roles WHERE role_name = 'member')
        )
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
            users.id_user,
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
            users.id_user,
            users.username,
            roles.role_name,
            users.registered_at
        FROM users
        INNER JOIN roles
            ON users.role_id = roles.id_role
        ORDER BY users.id_user
        `
    );

    return result.rows;
}
async function updateUserRole(userId, roleName) {

    const result = await pool.query(
        `
        WITH target AS (
            SELECT u.id_user, r.role_name AS old_role
            FROM users u
            JOIN roles r ON r.id_role = u.role_id
            WHERE u.id_user = $2
              AND r.role_name IN ('member', 'admin')
        )
        UPDATE users
        SET role_id = (SELECT id_role FROM roles WHERE role_name = $1)
        FROM target
        WHERE users.id_user = target.id_user
        RETURNING users.id_user, users.username, target.old_role
        `,
        [roleName, userId]
    );

    return result.rows[0] ?? null;
}

export default {
    registerUser,
    getUserById,
    getAllUsers,
    updateUserRole
};