import pool from "../database/pool.js";
import bcrypt from "bcryptjs";

async function login(username,password){

    const result = await pool.query(
        "SELECT * FROM users WHERE username=$1",
        [username]
    );

    if(result.rows.length === 0){
        return null;
    }

    const user = result.rows[0];

    const correct = await bcrypt.compare(
        password,
        user.password_hash
    );

    if(!correct){
        return null;
    }

    return user;
}


export default {
    login
};