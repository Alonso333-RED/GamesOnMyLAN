import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import unzipper from "unzipper";
import { Transform } from "stream";
import { pipeline } from "stream/promises";

const DATA_PATH = path.join(process.cwd(), "data");
const DEFAULT_THUMBNAIL = path.join(process.cwd(), "public", "img", "default_game.png");

const MAX_FILES = 10000;
const MAX_TOTAL_BYTES = 1024 * 1024 * 1024;

const storageService = {

    async extractGame(zipFile, id_game, entry_file) {

        const gameFolder = path.join(DATA_PATH, "games", String(id_game));
        await fsp.mkdir(gameFolder, { recursive: true });

        await this._extractZipSafely(zipFile.path, gameFolder);

        await this.normalizeGameFolder(gameFolder, entry_file);
        await fsp.unlink(zipFile.path);
        return gameFolder;
    },

    // Para reemplazar archivos de un juego que YA existe: extrae a una carpeta
    // temporal primero. Solo si todo sale bien, borra la carpeta real y pone
    // la nueva en su lugar. Si algo falla, el juego actual queda intacto.
    async replaceGameFiles(id_game, zipFile, entry_file) {

        const finalFolder = path.join(DATA_PATH, "games", String(id_game));
        const stagingFolder = path.join(
            DATA_PATH,
            "games",
            `${id_game}_staging_${Date.now()}`
        );

        await fsp.mkdir(stagingFolder, { recursive: true });

        try {
            await this._extractZipSafely(zipFile.path, stagingFolder);
            await this.normalizeGameFolder(stagingFolder, entry_file);
        } catch (error) {
            await fsp.rm(stagingFolder, { recursive: true, force: true });
            throw error;
        }

        await fsp.rm(finalFolder, { recursive: true, force: true });
        await fsp.rename(stagingFolder, finalFolder);
        await fsp.unlink(zipFile.path);

        return finalFolder;
    },

    // Extracción con protección Zip Slip (la misma lógica de antes,
    // ahora reutilizable tanto para juegos nuevos como para reemplazos).
    async _extractZipSafely(zipFilePath, destFolder) {

        const resolvedRoot = path.resolve(destFolder);
        const directory = await unzipper.Open.file(zipFilePath);

        // Capa 2: rechazo rápido según lo que el zip DECLARA
        if (directory.files.length > MAX_FILES) {
            throw new Error("ZIP con demasiados archivos");
        }

        const declaredTotal = directory.files.reduce(
            (sum, f) => sum + (f.uncompressedSize || 0),
            0
        );

        if (declaredTotal > MAX_TOTAL_BYTES) {
            throw new Error("ZIP demasiado grande al descomprimir");
        }

        // Capa 3: conteo de bytes REALES (el tamaño declarado se puede falsificar)
        let total = 0;

        for (const file of directory.files) {

            const destPath = path.resolve(
                path.join(destFolder, file.path)
            );

            if (
                destPath !== resolvedRoot &&
                !destPath.startsWith(resolvedRoot + path.sep)
            ) {
                throw new Error(
                    `ZIP inválido: entrada fuera de la carpeta destino (${file.path})`
                );
            }

            if (file.type === "Directory") {
                await fsp.mkdir(destPath, { recursive: true });
                continue;
            }

            await fsp.mkdir(path.dirname(destPath), { recursive: true });

            const declaredSize = file.uncompressedSize || 0;
            let fileBytes = 0;

            await pipeline(
                file.stream(),
                new Transform({
                    transform(chunk, enc, cb) {
                        fileBytes += chunk.length;
                        total += chunk.length;

                        if (fileBytes > declaredSize) {
                            return cb(new Error("ZIP inválido: un archivo excede su tamaño declarado"));
                        }

                        if (total > MAX_TOTAL_BYTES) {
                            return cb(new Error("ZIP demasiado grande al descomprimir"));
                        }

                        cb(null, chunk);
                    }
                }),
                fs.createWriteStream(destPath)
            );
        }
    },

    async storeThumbnail(thumbnailFile, id_game) {

        if (thumbnailFile && thumbnailFile.size > 5 * 1024 * 1024) {
            throw new Error("La miniatura no puede pesar más de 5 MB");
        }

        const thumbnailFolder = path.join(DATA_PATH, "thumbnails");
        await fsp.mkdir(thumbnailFolder, { recursive: true });

        const thumbnailPath = path.join(thumbnailFolder, `${id_game}.png`);

        if (thumbnailFile) {
            await fsp.rename(thumbnailFile.path, thumbnailPath);
        } else {
            await fsp.copyFile(DEFAULT_THUMBNAIL, thumbnailPath);
        }

        return thumbnailPath;
    },

    async normalizeGameFolder(gameFolder, entry_file) {

        const root = path.resolve(gameFolder);
        const target = path.resolve(root, entry_file);

        if (!target.startsWith(root + path.sep)) {
            throw new Error("Archivo principal inválido");
        }

        try {
            await fsp.access(path.join(gameFolder, entry_file));
            return;
        } catch {}

        const entries = await fsp.readdir(gameFolder, { withFileTypes: true });

        if (entries.length !== 1 || !entries[0].isDirectory()) {
            throw new Error(
                "El archivo principal no se encontró en la raíz del ZIP."
            );
        }

        const innerFolder = path.join(gameFolder, entries[0].name);

        try {
            await fsp.access(path.join(innerFolder, entry_file));
        } catch {
            throw new Error(
                "El archivo principal no existe dentro del ZIP."
            );
        }

        // Renombrar la carpeta contenedora a un nombre temporal para que ningún
        // hijo (ej: games/games) choque con el nombre de su propio padre.
        const tempFolder = path.join(gameFolder, `__normalize_${Date.now()}`);
        await fsp.rename(innerFolder, tempFolder);

        const innerEntries = await fsp.readdir(tempFolder);

        for (const entry of innerEntries) {
            await fsp.rename(
                path.join(tempFolder, entry),
                path.join(gameFolder, entry)
            );
        }
        await fsp.rmdir(tempFolder);
    },

    async deleteGameFiles(id_game) {

        const gameFolder = path.join(DATA_PATH, "games", String(id_game));
        const thumbnailPath = path.join(DATA_PATH, "thumbnails", `${id_game}.png`);

        await fsp.rm(gameFolder, { recursive: true, force: true });
        await fsp.rm(thumbnailPath, { force: true });
    },

    async deleteGameFolder(id_game) {

        const gameFolder = path.join(DATA_PATH, "games", String(id_game));
        await fsp.rm(gameFolder, { recursive: true, force: true });
    }

};

export default storageService;