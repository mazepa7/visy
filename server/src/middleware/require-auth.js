import { findSessionUser } from '../modules/auth/auth.service.js';

export async function requireAuth(req, res, next) {
  try {
    const user = await findSessionUser(req.cookies.visy_session);
    if (!user) return res.status(401).json({ error: 'Faça login para continuar.' });
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}
