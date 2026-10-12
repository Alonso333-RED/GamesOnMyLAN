// Convierte una ruta de /public ("/img/logo.png") en una ruta que respeta el
// "base" de Vite. En GitHub Pages el sitio vive en /GamesOnMyLAN/, así que
// "/img/logo.png" apuntaría a la raíz del dominio y daría 404.
export function asset(path) {
    return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
