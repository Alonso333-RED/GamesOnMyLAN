import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Este test NO conoce de antemano cuáles son tus imports: los lee del
// código fuente y comprueba, uno por uno, que el archivo al que apuntan
// existe de verdad en el disco. Es justo el tipo de error que tuvimos
// tres veces al mover carpetas a src/ (imports que quedaban apuntando
// al lugar viejo) — este test lo detecta solo, sin que tengas que
// acordarte de revisar a mano cada vez que muevas algo.

const PROJECT_ROOT = process.cwd();

// Carpetas que no queremos recorrer: dependencias, control de versiones,
// datos/certificados (no tienen código), y los propios tests (para no
// mezclar sus imports a "vitest" con los del proyecto).
const IGNORED_DIRS = new Set([
    "node_modules", ".git", "data", "certs", "tests"
]);

function listJsFiles(dir) {

    let results = [];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {

        if (entry.isDirectory()) {
            if (IGNORED_DIRS.has(entry.name)) continue;
            results = results.concat(listJsFiles(path.join(dir, entry.name)));
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(".js")) {
            results.push(path.join(dir, entry.name));
        }

    }

    return results;

}

// Extrae los specifiers de import/export/import() dinámico que empiecen
// con "." o ".." (imports relativos). Ignora paquetes de npm (express,
// pg, etc.), esos los resuelve node_modules y no nos interesan acá.
function extractRelativeImports(fileContent) {

    const patterns = [
        /import\s+[\s\S]*?from\s+["'](\.[^"']+)["']/g,
        /export\s+[\s\S]*?from\s+["'](\.[^"']+)["']/g,
        /import\s*\(\s*["'](\.[^"']+)["']\s*\)/g,
        /^\s*import\s+["'](\.[^"']+)["']/gm
    ];

    const specifiers = new Set();

    for (const pattern of patterns) {
        for (const match of fileContent.matchAll(pattern)) {
            specifiers.add(match[1]);
        }
    }

    return [...specifiers];

}

describe("imports relativos apuntan a archivos que existen", () => {

    const jsFiles = listJsFiles(PROJECT_ROOT);

    // Sanity check del test en sí: si esto da 0, algo del propio test
    // está mal apuntado (carpeta ignorada de más, cwd incorrecto, etc.)
    it("encontró archivos .js para revisar", () => {
        expect(jsFiles.length).toBeGreaterThan(0);
    });

    for (const filePath of jsFiles) {

        const relativeFilePath = path.relative(PROJECT_ROOT, filePath);
        const content = fs.readFileSync(filePath, "utf8");
        const imports = extractRelativeImports(content);

        for (const specifier of imports) {

            it(`${relativeFilePath} → "${specifier}" existe`, () => {

                const resolved = path.resolve(path.dirname(filePath), specifier);

                expect(
                    fs.existsSync(resolved),
                    `No se encontró el archivo resuelto: ${resolved}\n` +
                    `(importado desde ${relativeFilePath} como "${specifier}")`
                ).toBe(true);

            });

        }

    }

});
