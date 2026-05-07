import { createClient } from '@supabase/supabase-js';
import { env as publicEnv } from '$env/dynamic/public';

const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = publicEnv.PUBLIC_SUPABASE_ANON_KEY || publicEnv.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		'Missing public Supabase env: set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY (or PUBLIC_SUPABASE_PUBLISHABLE_KEY).'
	);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);