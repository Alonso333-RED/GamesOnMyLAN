import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import unzipper from "unzipper";

const DATA_PATH = path.join(process.cwd(), "data");
const DEFAULT_THUMBNAIL = path.join(process.cwd(), "public", "img", "default_game.png");

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

            await new Promise((resolve, reject) => {
                file.stream()
                    .pipe(fs.createWriteStream(destPath))
                    .on("finish", resolve)
                    .on("error", reject);
            });
        }
    },

    // La miniatura ahora es opcional: si no llega archivo, se usa
    // la imagen por defecto del proyecto.
    async storeThumbnail(thumbnailFile, id_game) {

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

        const innerEntries = await fsp.readdir(innerFolder);

        for (const entry of innerEntries) {
            await fsp.rename(
                path.join(innerFolder, entry),
                path.join(gameFolder, entry)
            );
        }
        await fsp.rmdir(innerFolder);
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