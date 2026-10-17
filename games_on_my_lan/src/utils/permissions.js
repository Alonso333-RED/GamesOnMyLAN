export const ROLE_RANK = { member: 1, admin: 2, owner: 3 };

export function canDeleteGame({ actorId, actorRole, authorId, authorRole }) {
  if (actorId === authorId) return true;

  const actorRank = ROLE_RANK[actorRole] ?? 0;
  const authorRank = ROLE_RANK[authorRole] ?? Infinity;

  return actorRank > authorRank;
}

export function canDeleteUser({ actorId, actorRole, targetId, targetRole }) {
  if (actorId === targetId) return actorRole !== 'owner';

  if (actorRole === 'owner') return true;

  if (actorRole === 'admin') return targetRole === 'member';

  return false;
}
