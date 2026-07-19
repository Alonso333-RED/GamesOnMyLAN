import pool from "../database/pool.js";


export function requireLogin(req, res, next){

    if(!req.session.user){
        return res.status(401).send("Debes iniciar sesión");
    }

    next();
}

export function requireRole(...roles){

    return async (req,res,next)=>{

        try {

            const result = await pool.query(
                `
                SELECT roles.role_name
                FROM users
                JOIN roles
                ON users.role_id = roles.id
                WHERE users.id = $1
                `,
                [req.session.user.id]
            );


            if(result.rows.length === 0){
                return res.status(403).send("Usuario no encontrado");
            }


            const role = result.rows[0].role_name;


            if(!roles.includes(role)){
                return res.status(403).send("Sin permisos");
            }


            next();


        } catch(error){

            console.error(error);
            res.status(500).send("Error verificando permisos");

        }

    };

}