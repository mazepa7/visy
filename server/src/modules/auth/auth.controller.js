import { loginSchema, registerSchema } from './auth.schemas.js';
import {
  clearSessionCookieOptions,
  deleteSession,
  findSessionUser,
  loginAccount,
  registerAccount,
  sessionCookieOptions,
} from './auth.service.js';

function validationMessage(error) {
  return error.issues[0]?.message || 'Confira os dados e tente novamente.';
}

export async function register(req, res, next) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: validationMessage(parsed.error) });

  try {
    const result = await registerAccount(parsed.data);
    res.cookie('visy_session', result.session.token, sessionCookieOptions(result.session.expiresAt));
    return res.status(201).json({ user: result.user });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Esse e-mail ou usuário já está em uso.' });
    return next(error);
  }
}

export async function login(req, res, next) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: validationMessage(parsed.error) });

  try {
    const result = await loginAccount(parsed.data);
    if (!result) return res.status(401).json({ error: 'E-mail/usuário ou senha incorretos.' });
    res.cookie('visy_session', result.session.token, sessionCookieOptions(result.session.expiresAt));
    return res.json({ user: result.user });
  } catch (error) {
    return next(error);
  }
}

export async function logout(req, res, next) {
  try {
    await deleteSession(req.cookies.visy_session);
    res.clearCookie('visy_session', clearSessionCookieOptions());
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    return res.json({ user: await findSessionUser(req.cookies.visy_session) });
  } catch (error) {
    return next(error);
  }
}
