import fsp from "fs/promises";
import { MAX_IMAGE_DIMENSION } from "./limits.js";

export const ENTRY_FILE_ERROR =
    "Archivo principal inválido: usa una ruta relativa como index.html o build/juego.html (solo letras, números, espacios, _ - . y terminada en .html/.htm).";

const ENTRY_FILE_RE = /^[\p{L}\p{N}_\- .]+(\/[\p{L}\p{N}_\- .]+)*\.html?$/iu;

// Devuelve el entry_file limpio, o null si no es válido.
export function validateEntryFile(value) {

    if (typeof value !== "string") return null;

    const entry = value.trim();

    if (entry.length === 0 || entry.length > 200) return null;
    if (!ENTRY_FILE_RE.test(entry)) return null;

    // Ningún segmento puede empezar con "." (cubre "..", "." y ocultos)
    // ni estar vacío/solo espacios.
    const badSegment = entry
        .split("/")
        .some((seg) => seg.startsWith(".") || seg.trim() === "");

    return badSegment ? null : entry;
}

// ---------- Imágenes PNG (miniaturas y avatares) ----------

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function invalidImage(message) {
    const err = new Error(message);
    err.status = 400; // el manejador de errores de app.js responde 400 con este mensaje
    return err;
}

// Comprueba que el archivo sea realmente un PNG mirando su contenido, no su
// extensión: firma de 8 bytes + primer bloque IHDR + dimensiones razonables.
// Lanza un error con status 400 si no lo es.
export async function assertPngFile(filePath) {

    const handle = await fsp.open(filePath, "r");
    const header = Buffer.alloc(24);
    let bytesRead = 0;

    try {
        ({ bytesRead } = await handle.read(header, 0, 24, 0));
    } finally {
        await handle.close();
    }

    const looksLikePng =
        bytesRead === 24 &&
        header.subarray(0, 8).equals(PNG_SIGNATURE) &&
        header.readUInt32BE(8) === 13 &&
        header.toString("ascii", 12, 16) === "IHDR";

    if (!looksLikePng) {
        throw invalidImage("El archivo no es un PNG válido");
    }

    const width = header.readUInt32BE(16);
    const height = header.readUInt32BE(20);

    if (width === 0 || height === 0) {
        throw invalidImage("El archivo no es un PNG válido");
    }

    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        throw invalidImage(
            `La imagen es demasiado grande: máximo ${MAX_IMAGE_DIMENSION}×${MAX_IMAGE_DIMENSION} píxeles`
        );
    }
}
