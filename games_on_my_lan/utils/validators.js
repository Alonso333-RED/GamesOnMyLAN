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