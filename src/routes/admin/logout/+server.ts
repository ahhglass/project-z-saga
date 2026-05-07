import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { COOKIE_NAME } from '$lib/admin/auth';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete(COOKIE_NAME, { path: '/' });
	throw redirect(302, '/admin/login');
};
