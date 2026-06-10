import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  dbCreateSession,
  dbDeleteSession,
  dbGetSession,
  getUserById,
  type User,
} from "./db";

export const SESSION_COOKIE = "sez_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type SafeUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  phone: string;
  address: string;
};

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const test = scryptSync(password, salt, 64);
  return hashBuf.length === test.length && timingSafeEqual(hashBuf, test);
}

function toSafe(u: User): SafeUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    phone: u.phone,
    address: u.address,
  };
}

/** Create a session row + set the httpOnly cookie. Call from a Route Handler. */
export async function startSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await dbCreateSession(token, userId, expiresAt);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

/** Read the current session user (or null). Safe to call in Server Components. */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await dbGetSession(token);
  if (!session || session.expires_at < Date.now()) return null;
  const user = await getUserById(session.user_id);
  return user ? toSafe(user) : null;
}

/** Destroy the session + clear cookie. Call from a Route Handler. */
export async function endSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await dbDeleteSession(token);
  store.delete(SESSION_COOKIE);
}
