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
};

export default gamesService;