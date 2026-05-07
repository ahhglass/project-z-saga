/**
 * Supabase client for server-only use (service role).
 * Used for admin login check and any admin-only DB access.
 * Never expose service role key to the client.
 * Uses dynamic private env so Vercel can provide secrets at runtime.
 */
import { createClient } from '@supabase/supabase-js';
import { env as publicEnv } from '$env/dynamic/public';
import { env } from '$env/dynamic/private';

export function getSupabaseServer() {
	const url = publicEnv.PUBLIC_SUPABASE_URL;
	const key = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) {
		throw new Error(
			'Missing env: PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them in Vercel (Environment Variables) or .env.local.'
		);
	}
	return createClient(url, key);
}
