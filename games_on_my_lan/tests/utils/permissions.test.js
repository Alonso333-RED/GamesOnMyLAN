import { describe, it, expect } from "vitest";
import { canDeleteGame } from "../../src/utils/permissions.js";

describe("canDeleteGame", () => {

    it("permite al autor borrar su propio juego, aunque sea member", () => {
        expect(canDeleteGame({
            actorId: 1, actorRole: "member",
            authorId: 1, authorRole: "member"
        })).toBe(true);
    });

    it("permite a un admin borrar el juego de un member", () => {
        expect(canDeleteGame({
            actorId: 2, actorRole: "admin",
            authorId: 1, authorRole: "member"
        })).toBe(true);
    });

    it("no permite a un admin borrar el juego de otro admin", () => {
        expect(canDeleteGame({
            actorId: 2, actorRole: "admin",
            authorId: 1, authorRole: "admin"
        })).toBe(false);
    });

    it("permite al owner borrar cualquier juego", () => {
        expect(canDeleteGame({
            actorId: 3, actorRole: "owner",
            authorId: 1, authorRole: "admin"
        })).toBe(true);
    });

    it("no permite a un member borrar el juego de otro usuario", () => {
        expect(canDeleteGame({
            actorId: 2, actorRole: "member",
            authorId: 1, authorRole: "member"
        })).toBe(false);
    });

    it("niega el acceso si el rol del actor es desconocido", () => {
        expect(canDeleteGame({
            actorId: 2, actorRole: "rol_inventado",
            authorId: 1, authorRole: "member"
        })).toBe(false);
    });

});
