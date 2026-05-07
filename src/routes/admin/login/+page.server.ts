import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getSupabaseServer } from '$lib/supabaseServer';
import bcrypt from 'bcryptjs';
import {
	createSession,
	verifySession,
	getSessionCookie,
	sessionCookieHeader,
	COOKIE_NAME
} from '$lib/admin/auth';

export async function load({ cookies, request }) {
	const token = getSessionCookie(request.headers.get('cookie'));
	if (token) {
		const session = await verifySession(token);
		if (session) throw redirect(302, '/admin');
	}
	return {};
}

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		try {
			const formData = await request.formData();
			const login = (formData.get('login') as string)?.trim();
			const password = formData.get('password') as string;

			if (!login || !password) {
				return { error: 'Login and password required.' };
			}

			const supabase = getSupabaseServer();
			const { data: user, error } = await supabase
				.from('admin_users')
				.select('id, login, password_hash')
				.eq('login', login)
				.maybeSingle();

			if (error) {
				console.error('[admin login] Supabase error:', error.message, error.code);
				return { error: 'Invalid login or password.' };
			}
			if (!user) {
				return { error: 'Invalid login or password.' };
			}

			const ok = await bcrypt.compare(password, user.password_hash);
			if (!ok) {
				return { error: 'Invalid login or password.' };
			}

			const token = await createSession({ id: user.id, login: user.login });
			cookies.set(COOKIE_NAME, token, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7,
				secure: process.env.NODE_ENV === 'production'
			});

			throw redirect(302, '/admin');
		} catch (e) {
			if (e && typeof e === 'object' && 'status' in e && e.status === 302) throw e;
			const message = e instanceof Error ? e.message : String(e);
			console.error('[admin login]', e);
			return { error: `Error: ${message}` };
		}
	}
};
