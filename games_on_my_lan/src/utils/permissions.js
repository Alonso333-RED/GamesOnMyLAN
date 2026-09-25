export const ROLE_RANK = { member: 1, admin: 2, owner: 3 };

// Fuente única de la regla. La usan el middleware (seguridad real)
// y la vista (para decidir si se muestra el botón).
export function canDeleteGame({ actorId, actorRole, authorId, authorRole }) {

    if (actorId === authorId) return true;

    // Rol desconocido del actor => rango 0 (nada). Rol desconocido del autor
    // => rango infinito (protegido). Ante la duda, se niega.
    const actorRank = ROLE_RANK[actorRole] ?? 0;
    const authorRank = ROLE_RANK[authorRole] ?? Infinity;

    return actorRank > authorRank;
}