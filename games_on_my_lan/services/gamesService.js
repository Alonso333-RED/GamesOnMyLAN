import pool from "../database/pool.js";

const gamesService = {

    async getGames() {

        const result = await pool.query(`
            SELECT
                games.id_game,
                games.game_name,
                games.game_description,
                games.entry_file,
                users.username AS author_username
            FROM games
            JOIN users ON games.author_id = users.id_user
            ORDER BY games.updated_at DESC;
        `);

        return result.rows;

    },

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

    async getGameById(id) {

        const result = await pool.query(
            `
            SELECT
                games.id_game,
                games.game_name,
                games.game_description,
                games.entry_file,
                users.username AS author_username
            FROM games
            JOIN users ON games.author_id = users.id_user
            WHERE games.id_game = $1;
            `,
            [id]
        );

        return result.rows[0];

    },

    async deleteGame(id, userId) {

        const result = await pool.query(
            `
            DELETE FROM games
            WHERE id_game = $1
            AND author_id = $2;
            `,
            [
                id,
                userId
            ]
        );

        return result.rowCount > 0;
    }
};

export default gamesService;