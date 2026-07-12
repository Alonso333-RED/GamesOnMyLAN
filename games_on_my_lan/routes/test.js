import express from "express";
import pool from "../database/connection.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            status: "ok",
            database: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

export default router;