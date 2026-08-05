import pool from "../database/pool.js";

const gamesService = {

    async createGame(game) {

        const result = await pool.query(
            `
            INSERT INTO games
            (
                game_name,
                game_description,
                entry_file,
                author_id
            )
            VALUES ($1,$2,$3,$4)
            RETURNING *;
            `,
            [
                game.game_name,
                game.game_description,
                game.entry_file,
                game.author_id
            ]
        );
        return result.rows[0];
    },

    async getAllGames() {
        const result = await pool.query(
            `
            SELECT 
                g.id_game,
                g.game_name,
                g.game_description,
                g.entry_file,
                g.updated_at,
                u.username AS author_name
            FROM games g
            JOIN users u ON g.author_id = u.id_user
            ORDER BY g.updated_at DESC;
            `
        );
        return result.rows;
    },

    async getGameById(id_game) {

        const result = await pool.query(
            `
            SELECT *
            FROM games
            WHERE id_game = $1;
            `,
            [id_game]
        );

        return result.rows[0];

    }
};

export default gamesService;