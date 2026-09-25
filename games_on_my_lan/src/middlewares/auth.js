import pool from "../database/pool.js";
import { canDeleteGame } from "../utils/permissions.js";


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
                ON users.role_id = roles.id_role
                WHERE users.id_user = $1
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

export function requireOwnership(req,res,next){

    const userId = req.session.user.id;
    const gameId = req.params.id;

    pool.query(
        `
        SELECT *
        FROM games
        WHERE id_game = $1 AND author_id = $2
        `,
        [gameId, userId]
    )
    .then(result => {

        if(result.rows.length === 0){
            return res.status(403).send("No eres el propietario del juego");
        }

        next();

    })
    .catch(error => {
        console.error(error);
        res.status(500).send("Error verificando propiedad del juego");
    });

}

export async function requireCanDelete(req, res, next) {

    const gameId = req.params.id;

    if (!/^\d{1,9}$/.test(gameId)) {
        return res.status(404).send("Juego no encontrado");
    }

    try {

        const result = await pool.query(
            `
            SELECT
                g.author_id,
                author_role.role_name AS author_role,
                actor_role.role_name  AS actor_role
            FROM games g
            JOIN users author      ON author.id_user = g.author_id
            JOIN roles author_role ON author_role.id_role = author.role_id
            JOIN users actor       ON actor.id_user = $2
            JOIN roles actor_role  ON actor_role.id_role = actor.role_id
            WHERE g.id_game = $1
            `,
            [gameId, req.session.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Juego no encontrado");
        }

        const row = result.rows[0];
        const actorId = req.session.user.id;

        const allowed = canDeleteGame({
            actorId,
            actorRole: row.actor_role,
            authorId: row.author_id,
            authorRole: row.author_role
        });

        if (!allowed) {
            return res.status(403).send("No tienes permiso para eliminar este juego");
        }

        // Para el registro de moderación en el controlador
        req.moderation = {
            isAuthor: row.author_id === actorId,
            actorRole: row.actor_role,
            authorRole: row.author_role
        };

        next();

    } catch (error) {
        console.error(error);
        res.status(500).send("Error verificando permisos");
    }
}