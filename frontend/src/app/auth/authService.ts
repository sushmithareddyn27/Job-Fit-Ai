import type { AuthCredentials, AuthSession, AuthSignUp, AuthUser } from './types';
import { clearSession, loadSession, loadUsers, saveSession, saveUsers, setProfileCompleted, setSessionStorage, toPublicUser } from './storage';

function now() {
  return Date.now();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function sha256Hex(input: string): Promise<string> {
  // Browser crypto (works in Vite/React). This is NOT a secure auth system,
  // but it's better than storing plaintext passwords for a demo.
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(hashBuf));
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getCurrentSession(): AuthSession | null {
  return loadSession();
}

export function logout() {
  clearSession();
}

export async function signUp(payload: AuthSignUp): Promise<AuthUser> {
  const users = loadUsers();
  const email = normalizeEmail(payload.email);
  if (!payload.name.trim()) throw new Error('Name is required.');
  if (!email) throw new Error('Email is required.');
  if (!payload.password) throw new Error('Password is required.');
  if (users.some((u) => u.email === email && u.role === payload.role)) {
    throw new Error('An account already exists for this email and role.');
  }

  const passwordHash = await sha256Hex(payload.password);
  const user = {
    id: crypto.randomUUID(),
    role: payload.role,
    name: payload.name.trim(),
    email,
    passwordHash
  };
  users.push(user);
  saveUsers(users);
  setProfileCompleted(payload.role, email, false);
  return toPublicUser(user);
}

export async function login(role: AuthUser['role'], creds: AuthCredentials): Promise<AuthSession> {
  return loginWithOptions(role, creds, { rememberMe: true });
}

export async function loginWithOptions(
  role: AuthUser['role'],
  creds: AuthCredentials,
  options: { rememberMe: boolean }
): Promise<AuthSession> {
  const users = loadUsers();
  const email = normalizeEmail(creds.email);
  const passwordHash = await sha256Hex(creds.password);

  const match = users.find((u) => u.email === email && u.role === role);
  if (!match || match.passwordHash !== passwordHash) {
    throw new Error('Invalid email or password.');
  }

  setSessionStorage(options.rememberMe ? 'local' : 'session');

  const session: AuthSession = {
    user: toPublicUser(match),
    createdAt: now()
  };
  saveSession(session);
  return session;
}
