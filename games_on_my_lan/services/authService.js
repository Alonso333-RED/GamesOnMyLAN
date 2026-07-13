// services/authService.js

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


    const usuario = result.rows[0];


    const correcto = await bcrypt.compare(
        password,
        usuario.password_hash
    );


    if(!correcto){
        return null;
    }


    return usuario;
}


export default {
    login
};