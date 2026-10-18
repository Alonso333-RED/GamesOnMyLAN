export const regenerateSession = (req) =>
  new Promise((resolve, reject) =>
    req.session.regenerate((err) => (err ? reject(err) : resolve())),
  );

export const saveSession = (req) =>
  new Promise((resolve, reject) => req.session.save((err) => (err ? reject(err) : resolve())));

export const destroySession = (req) =>
  new Promise((resolve, reject) => req.session.destroy((err) => (err ? reject(err) : resolve())));

export async function endSession(req, res) {
  await destroySession(req);

  res.clearCookie('__Host-goml.sid', {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

// Cierra todas las sesiones del usuario salvo la actual (p. ej. tras cambiar la contraseña).
// Solo funciona si el almacén de sesiones sabe listar sesiones con su id (como el MemoryStore
// por defecto). Si no puede, devuelve 0 sin hacer nada.
export async function destroyOtherSessions(req, userId) {
  const store = req.sessionStore;

  if (!store || typeof store.all !== 'function' || typeof store.destroy !== 'function') {
    return 0;
  }

  const sessions = await new Promise((resolve, reject) =>
    store.all((err, all) => (err ? reject(err) : resolve(all))),
  );

  // Sin ids no se puede cerrar nada (algunos almacenes devuelven un arreglo)
  if (!sessions || typeof sessions !== 'object' || Array.isArray(sessions)) {
    return 0;
  }

  let destroyed = 0;

  for (const [sid, data] of Object.entries(sessions)) {
    if (sid === req.sessionID || data?.user?.id !== userId) continue;

    await new Promise((resolve, reject) =>
      store.destroy(sid, (err) => (err ? reject(err) : resolve())),
    );
    destroyed++;
  }

  return destroyed;
}
