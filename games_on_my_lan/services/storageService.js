import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import unzipper from "unzipper";

const DATA_PATH = path.join(
    process.cwd(),
    "data"
);

const storageService = {

    async extractGame(zipFile, id_game, entry_file) {

        const gameFolder = path.join(
            DATA_PATH,
            "games",
            String(id_game)
        );

        await fsp.mkdir(gameFolder, {
            recursive: true
        });

        await fs.createReadStream(zipFile.path)
            .pipe(
                unzipper.Extract({
                    path: gameFolder
                })
            )
            .promise();

        await this.normalizeGameFolder(gameFolder, entry_file);
        await fsp.unlink(zipFile.path);
        return gameFolder;
    },

    async storeThumbnail(thumbnailFile, id_game) {

        const thumbnailFolder = path.join(
            DATA_PATH,
            "thumbnails"
        );

        await fsp.mkdir(thumbnailFolder, {
            recursive: true
        });

        const thumbnailPath = path.join(
            thumbnailFolder,
            `${id_game}.png`
        );

        await fsp.rename(
            thumbnailFile.path,
            thumbnailPath
        );

        return thumbnailPath;
    },

        async normalizeGameFolder(gameFolder, entry_file) {

        try {

            await fsp.access(
                path.join(gameFolder, entry_file)
            );

            return;

        } catch {}

        // Leer el contenido de la carpeta del juego
        const entries = await fsp.readdir(
            gameFolder,
            {
                withFileTypes: true
            }
        );

        // Debe existir exactamente una carpeta
        if (
            entries.length !== 1 ||
            !entries[0].isDirectory()
        ) {
            throw new Error(
                "El archivo principal no se encontró en la raíz del ZIP."
            );
        }


        const innerFolder = path.join(
            gameFolder,
            entries[0].name
        );

        // Verificar que dentro esté el archivo principal
        try {
            await fsp.access(
                path.join(
                    innerFolder,
                    entry_file
                )
            );

        } catch {

            throw new Error(
                "El archivo principal no existe dentro del ZIP."
            );

        }

        // Mover todo un nivel arriba
        const innerEntries = await fsp.readdir(
            innerFolder
        );

        for (const entry of innerEntries) {

            await fsp.rename(

                path.join(
                    innerFolder,
                    entry
                ),
                path.join(
                    gameFolder,
                    entry
                )
            );
        }
        await fsp.rmdir(innerFolder);

    },

    async deleteGameFiles(id_game) {

        const gameFolder = path.join(
            DATA_PATH,
            "games",
            String(id_game)
        );

        const thumbnailPath = path.join(
            DATA_PATH,
            "thumbnails",
            `${id_game}.png`
        );

        await fsp.rm(gameFolder, {
            recursive: true,
            force: true
        });

        await fsp.rm(thumbnailPath, {
            force: true
        });
    }

};

export default storageService;