import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/database/pool.js", () => ({
    default: { query: vi.fn() }
}));

import pool from "../../src/database/pool.js";
import { requireLogin, requireCanDelete } from "../../src/middlewares/auth.js";

// req/res falsos: no levantamos Express real, solo simulamos lo mínimo
// que el middleware necesita para ejercitar su lógica.
function mockRes() {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res;
}

describe("requireLogin", () => {

    it("deja pasar si hay un usuario en sesión", () => {

        const req = { session: { user: { id: 1 } } };
        const res = mockRes();
        const next = vi.fn();

        requireLogin(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();

    });

    it("responde 401 si no hay sesión iniciada", () => {

        const req = { session: {} };
        const res = mockRes();
        const next = vi.fn();

        requireLogin(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);

    });

});

describe("requireCanDelete", () => {

    beforeEach(() => {
        pool.query.mockReset();
    });

    it("responde 404 si el id del juego no es un número válido", async () => {

        const req = { params: { id: "abc" }, session: { user: { id: 1 } } };
        const res = mockRes();
        const next = vi.fn();

        await requireCanDelete(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(next).not.toHaveBeenCalled();
        // Ni siquiera debería haber consultado la BD con un id inválido
        expect(pool.query).not.toHaveBeenCalled();

    });

    it("deja pasar y anota req.moderation cuando el actor es el autor", async () => {

        pool.query.mockResolvedValueOnce({
            rows: [{ author_id: 7, author_role: "member", actor_role: "member" }]
        });

        const req = { params: { id: "10" }, session: { user: { id: 7 } } };
        const res = mockRes();
        const next = vi.fn();

        await requireCanDelete(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(req.moderation).toEqual({
            isAuthor: true,
            actorRole: "member",
            authorRole: "member"
        });

    });

    it("responde 403 cuando un member intenta borrar el juego de otro usuario", async () => {

        pool.query.mockResolvedValueOnce({
            rows: [{ author_id: 7, author_role: "member", actor_role: "member" }]
        });

        const req = { params: { id: "10" }, session: { user: { id: 99 } } };
        const res = mockRes();
        const next = vi.fn();

        await requireCanDelete(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();

    });

    it("responde 404 si el juego no existe", async () => {

        pool.query.mockResolvedValueOnce({ rows: [] });

        const req = { params: { id: "10" }, session: { user: { id: 1 } } };
        const res = mockRes();
        const next = vi.fn();

        await requireCanDelete(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);

    });

});
