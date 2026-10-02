import fsp from "fs/promises";

// Mueve un archivo. rename() es instantáneo, pero solo funciona dentro del
// mismo disco o volumen. Si origen y destino están en discos distintos
// (por ejemplo en Docker, donde data/ es un volumen y temp/ no), falla con
// el código EXDEV: en ese caso se copia el archivo y luego se borra el original.
export async function moveFile(source, destination) {

    try {
        await fsp.rename(source, destination);
    } catch (error) {
        if (error.code !== "EXDEV") {
            throw error;
        }

        await fsp.copyFile(source, destination);
        await fsp.unlink(source);
    }
}