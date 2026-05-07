/**
 * Admin session: signed JWT in cookie.
 * Server-only. Use for /admin protection and login.
 * Uses dynamic env so Vercel (and others) can provide secrets at runtime, not build time.
 */
import { SignJWT, jwtVerify } from 'jose';
import { env } from '$env/dynamic/private';

const COOKIE_NAME = 'admin_session';
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
	const secret = env.SUPABASE_JWT_SECRET;
	if (!secret) {
		throw new Error('Missing env: SUPABASE_JWT_SECRET. Add it in Vercel (Environment Variables) or .env.local.');
	}
	return new TextEncoder().encode(secret);
}

export interface AdminSession {
	sub: string; // admin user id (uuid)
	login: string;
	exp: number;
}

export async function createSession(payload: { id: string; login: string }): Promise<string> {
	return new SignJWT({
		login: payload.login
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setSubject(payload.id)
		.setExpirationTime(Math.floor(Date.now() / 1000) + MAX_AGE_SEC)
		.setIssuedAt()
		.sign(getSecret());
}

export async function verifySession(token: string): Promise<AdminSession | null> {
	try {
		const { payload } = await jwtVerify(token, getSecret());
		const sub = payload.sub;
		const login = payload.login as string;
		const exp = payload.exp ?? 0;
		if (!sub || !login || exp < Math.floor(Date.now() / 1000)) return null;
		return { sub, login, exp };
	} catch {
		return null;
	}
}

export function getSessionCookie(cookieHeader: string | null): string | null {
	if (!cookieHeader) return null;
	const parts = cookieHeader.split(';').map((s) => s.trim());
	for (const part of parts) {
		const [name, value] = part.split('=');
		if (name === COOKIE_NAME && value) return decodeURIComponent(value);
	}
	return null;
}

export function sessionCookieHeader(value: string, maxAgeSec: number = MAX_AGE_SEC): string {
	const secure = typeof process !== 'undefined' && process.env.NODE_ENV === 'production' ? '; Secure' : '';
	return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}

export { COOKIE_NAME };
