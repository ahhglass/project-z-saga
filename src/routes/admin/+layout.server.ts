import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getSessionCookie, verifySession } from '$lib/admin/auth';

export const load: LayoutServerLoad = async ({ request, url }) => {
	if (url.pathname === '/admin/login' || url.pathname === '/admin/login/') {
		const token = getSessionCookie(request.headers.get('cookie'));
		if (token) {
			const session = await verifySession(token);
			if (session) throw redirect(302, '/admin');
		}
		return {};
	}

	const token = getSessionCookie(request.headers.get('cookie'));
	const session = token ? await verifySession(token) : null;
	if (!session) throw redirect(302, '/admin/login');

	return { admin: { id: session.sub, login: session.login } };
};
