import { describe, it, expect, vi, beforeEach } from "vitest";

// Reemplaza el pool real de Postgres por uno falso ANTES de importar
// cualquier archivo que dependa de él. Así los tests corren sin necesitar
// una base de datos real ni settings.json configurado.
vi.mock("../../src/database/pool.js", () => ({
    default: { query: vi.fn() }
}));

import pool from "../../src/database/pool.js";
import gamesService from "../../src/services/gamesService.js";

describe("gamesService", () => {

    beforeEach(() => {
        pool.query.mockReset();
    });

    it("createGame inserta el juego y devuelve la fila creada", async () => {

        const fakeRow = { id_game: 1, game_name: "Pong" };
        pool.query.mockResolvedValueOnce({ rows: [fakeRow] });

        const result = await gamesService.createGame({
            game_name: "Pong",
            game_description: "clásico",
            entry_file: "index.html",
            author_id: 5
        });

        expect(pool.query).toHaveBeenCalledOnce();
        // Verifica que los parámetros lleguen en el orden correcto a la query
        expect(pool.query.mock.calls[0][1]).toEqual(
            ["Pong", "clásico", "index.html", 5]
        );
        expect(result).toEqual(fakeRow);

    });

    it("getAllGames devuelve la lista de juegos tal cual la entrega la BD", async () => {

        const fakeRows = [{ id_game: 1 }, { id_game: 2 }];
        pool.query.mockResolvedValueOnce({ rows: fakeRows });

        const result = await gamesService.getAllGames();

        expect(result).toEqual(fakeRows);

    });

    it("deleteGame devuelve undefined si el juego no existía", async () => {

        pool.query.mockResolvedValueOnce({ rows: [] });

        const result = await gamesService.deleteGame(999);

        expect(result).toBeUndefined();

    });

    it("deleteGame propaga el error si la query falla", async () => {

        pool.query.mockRejectedValueOnce(new Error("conexión perdida"));

        await expect(gamesService.deleteGame(1)).rejects.toThrow("conexión perdida");

    });

});
