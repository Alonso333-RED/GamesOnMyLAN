import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// A diferencia de tener las rutas "esperadas" escritas a mano en el test
// (lo cual no detectaría un bug si el propio código fuente apunta al
// lugar equivocado, como pasó con DEFAULT_THUMBNAIL), este test LEE el
// path.join(...) real de app.js y storageService.js y comprueba que lo
// que arma en tiempo de ejecución exista de verdad en el disco.

const PROJECT_ROOT = process.cwd(); // asumiendo `npm test` corrido desde games_on_my_lan/

function readSource(relativePath) {
    return fs.readFileSync(path.join(PROJECT_ROOT, relativePath), "utf8");
}

// Extrae los strings entre comillas de algo como: "src", "public"
function quotedParts(argsText) {
    return [...argsText.matchAll(/["']([^"']+)["']/g)].map(m => m[1]);
}

describe("rutas armadas con path.join() en tiempo de ejecución (app.js)", () => {

    const appJsSource = readSource("app.js");

    it("app.set('views', ...) apunta a una carpeta que existe", () => {

        const match = appJsSource.match(
            /app\.set\(\s*["']views["']\s*,\s*path\.join\(\s*__dirname\s*,\s*((?:["'][^"']+["']\s*,?\s*)+)\)\s*\)/
        );

        expect(match, "No se encontró la línea app.set('views', path.join(__dirname, ...)) en app.js").not.toBeNull();

        const resolved = path.join(PROJECT_ROOT, ...quotedParts(match[1]));

        expect(
            fs.existsSync(resolved),
            `La carpeta de vistas no existe: ${resolved}`
        ).toBe(true);

    });

    it("express.static(path.join(__dirname, ...)) para los archivos públicos apunta a una carpeta que existe", () => {

        const match = appJsSource.match(
            /express\.static\(\s*path\.join\(\s*__dirname\s*,\s*((?:["'][^"']+["']\s*,?\s*)+)\)\s*\)/
        );

        expect(match, "No se encontró express.static(path.join(__dirname, ...)) en app.js").not.toBeNull();

        const resolved = path.join(PROJECT_ROOT, ...quotedParts(match[1]));

        expect(
            fs.existsSync(resolved),
            `La carpeta de estáticos no existe: ${resolved}`
        ).toBe(true);

    });

});

describe("thumbnail por defecto (storageService.js)", () => {

    const storageServiceSource = readSource("src/services/storageService.js");

    it("DEFAULT_THUMBNAIL apunta a un archivo que existe", () => {

        const match = storageServiceSource.match(
            /const\s+DEFAULT_THUMBNAIL\s*=\s*path\.join\(\s*process\.cwd\(\)\s*,\s*((?:["'][^"']+["']\s*,?\s*)+)\)/
        );

        expect(match, "No se encontró DEFAULT_THUMBNAIL = path.join(process.cwd(), ...) en storageService.js").not.toBeNull();

        const resolved = path.join(PROJECT_ROOT, ...quotedParts(match[1]));

        expect(
            fs.existsSync(resolved),
            `El thumbnail por defecto no existe: ${resolved}`
        ).toBe(true);

    });

});

describe("schema.sql usado por el instalador (admin/install.js)", () => {

    const installSource = readSource("admin/install.js");

    it("schemaPath apunta a un archivo que existe", () => {

        const match = installSource.match(
            /const\s+schemaPath\s*=\s*path\.join\(\s*__dirname\s*,\s*((?:["'][^"']+["']\s*,?\s*)+)\)/
        );

        expect(match, "No se encontró schemaPath = path.join(__dirname, ...) en install.js").not.toBeNull();

        // __dirname en install.js es admin/, no la raíz del proyecto
        const resolved = path.join(PROJECT_ROOT, "admin", ...quotedParts(match[1]));

        expect(
            fs.existsSync(resolved),
            `schema.sql no existe en: ${resolved}`
        ).toBe(true);

    });

});

describe("carpeta de vistas: archivos .hbs esperados presentes", () => {

    // Esta parte sí asume la ubicación fija src/views, porque a diferencia
    // de arriba, acá lo que queremos confirmar es que el CONTENIDO de la
    // carpeta esté completo (nada se perdió al mover archivos), no dónde
    // apunta el código.
    const viewsDir = path.join(PROJECT_ROOT, "src", "views");

    const expectedViews = [
        "index.hbs", "login.hbs", "register.hbs", "profile.hbs",
        "games.hbs", "game.hbs", "new_game.hbs", "update_game.hbs",
        "users.hbs", "layouts/main.hbs", "partials/header.hbs"
    ];

    for (const view of expectedViews) {
        it(`existe src/views/${view}`, () => {
            expect(fs.existsSync(path.join(viewsDir, view))).toBe(true);
        });
    }

});
