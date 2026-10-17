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
