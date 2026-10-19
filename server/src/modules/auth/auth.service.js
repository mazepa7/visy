import { createHash, randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import { pool } from '../../config/database.js';

const SESSION_DAYS = 30;
const hashToken = (token) => createHash('sha256').update(token).digest('hex');

function publicUser(row) {
  return { id: row.id, displayName: row.display_name, username: row.username };
}

async function createSession(userId) {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await pool.query('DELETE FROM sessions WHERE expires_at <= NOW()');
  await pool.query(
    'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
    [tokenHash, userId, expiresAt],
  );
  return { token, expiresAt };
}

export async function registerAccount({ displayName, username, email, password }) {
  const normalizedUsername = username.toLowerCase();
  const normalizedEmail = email.toLowerCase();
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const result = await pool.query(
    `INSERT INTO users (display_name, username, username_normalized, email, email_normalized, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, display_name, username`,
    [displayName, username, normalizedUsername, email, normalizedEmail, passwordHash],
  );
  const user = result.rows[0];
  return { user: publicUser(user), session: await createSession(user.id) };
}

export async function loginAccount({ identifier, password }) {
  const normalized = identifier.toLowerCase();
  const result = await pool.query(
    `SELECT id, display_name, username, password_hash
       FROM users
      WHERE email_normalized = $1 OR username_normalized = $1
      LIMIT 1`,
    [normalized],
  );
  const row = result.rows[0];
  if (!row || !(await argon2.verify(row.password_hash, password))) return null;
  return { user: publicUser(row), session: await createSession(row.id) };
}

export async function findSessionUser(token) {
  if (!token) return null;
  const tokenHash = hashToken(token);
  const result = await pool.query(
    `SELECT u.id, u.display_name, u.username
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > NOW()
      LIMIT 1`,
    [tokenHash],
  );
  return result.rows[0] ? publicUser(result.rows[0]) : null;
}

export async function deleteSession(token) {
  if (token) await pool.query('DELETE FROM sessions WHERE token_hash = $1', [hashToken(token)]);
}

export function sessionCookieOptions(expiresAt) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: expiresAt,
  };
}

export function clearSessionCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' };
}
