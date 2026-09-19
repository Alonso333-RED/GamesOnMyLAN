export function csrfProtection(req, res, next) {

    // Métodos que no modifican datos
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }

    const expected = `https://${req.get("host")}`;
    const origin = req.get("origin");
    const referer = req.get("referer");

    const allowed = origin
        ? origin === expected
        : Boolean(referer) && referer.startsWith(expected + "/");

    if (!allowed) {
        console.warn(
            `Bloqueada petición ${req.method} ${req.originalUrl} ` +
            `(origin: ${origin ?? "ninguno"})`
        );
        return res.status(403).send("Solicitud bloqueada: origen no permitido");
    }

    next();
}