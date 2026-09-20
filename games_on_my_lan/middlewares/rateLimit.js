import rateLimit from "express-rate-limit";

const MINUTE = 60 * 1000;

const tooManyRequests = (message) => (req, res) => {
    console.warn(`Límite excedido: ${req.method} ${req.originalUrl} desde ${req.ip}`);
    res.status(429).send(message);
};

export const loginLimiter = rateLimit({
    windowMs: 15 * MINUTE,
    limit: 10,
    standardHeaders: true,   // envía Retry-After y RateLimit-*
    legacyHeaders: false,
    handler: tooManyRequests(
        "Demasiados intentos de inicio de sesión. Espera unos minutos e inténtalo de nuevo."
    )
});

export const registerLimiter = rateLimit({
    windowMs: 60 * MINUTE,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: tooManyRequests(
        "Demasiados registros desde esta red. Inténtalo más tarde."
    )
});