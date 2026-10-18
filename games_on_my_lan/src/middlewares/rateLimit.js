import rateLimit from 'express-rate-limit';

const MINUTE = 60 * 1000;

const tooManyRequests = (message) => (req, res) => {
  console.warn(`Límite excedido: ${req.method} ${req.originalUrl} desde ${req.ip}`);
  res.status(429).send(message);
};

export const loginLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  limit: 10,
  standardHeaders: true, // envía Retry-After y RateLimit-*
  legacyHeaders: false,
  handler: tooManyRequests(
    'Demasiados intentos de inicio de sesión. Espera unos minutos e inténtalo de nuevo.',
  ),
});

export const registerLimiter = rateLimit({
  windowMs: 60 * MINUTE,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests('Demasiados registros desde esta red. Inténtalo más tarde.'),
});

// Se cuenta por usuario (la ruta exige sesión). Solo suman los intentos con la contraseña
// actual incorrecta (el controlador marca res.locals.failedPasswordAttempt): equivocarse
// al repetir la nueva o elegir una clave corta no debe bloquear a nadie.
export const passwordChangeLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  requestWasSuccessful: (req, res) => !res.locals.failedPasswordAttempt,
  keyGenerator: (req) => `user:${req.session.user.id}`,
  handler: tooManyRequests(
    'Demasiados intentos de cambio de contraseña. Espera unos minutos e inténtalo de nuevo.',
  ),
});
