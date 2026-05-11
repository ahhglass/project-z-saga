import { createClient } from '@supabase/supabase-js';
import { env as publicEnv } from '$env/dynamic/public';
import { env } from '$env/dynamic/private';

export function getSupabaseServer() {
	const rawUrl = publicEnv.PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
	const url =
		rawUrl?.trim()?.replace(/\s+/g, '')?.replace(/\/+$/, '') || '';
	const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
	if (!url || !key) {
		throw new Error(
			'Missing env: set SUPABASE_SERVICE_ROLE_KEY and PUBLIC_SUPABASE_URL (or SUPABASE_URL) in Vercel Environment Variables or .env.local.'
		);
	}
	return createClient(url, key, {
		auth: { persistSession: false, autoRefreshToken: false }
	});
}
