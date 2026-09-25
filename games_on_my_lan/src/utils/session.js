export const regenerateSession = (req) =>
    new Promise((resolve, reject) =>
        req.session.regenerate((err) => (err ? reject(err) : resolve())));

export const saveSession = (req) =>
    new Promise((resolve, reject) =>
        req.session.save((err) => (err ? reject(err) : resolve())));