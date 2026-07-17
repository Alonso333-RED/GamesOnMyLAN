import pool from "../database/pool.js";


async function getProfile(userId) {

    const result = await pool.query(
        `
        SELECT 
            users.username,
            users.profile_image_path,
            roles.role_name,
            users.registered_at
        FROM users
        INNER JOIN roles
            ON users.role_id = roles.id
        WHERE users.id = $1
        `,
        [userId]
    );


    if (result.rows.length === 0) {
        return null;
    }


    return result.rows[0];

}


export default {
    getProfile
};