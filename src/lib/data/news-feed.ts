/**
 * Minimal Supabase query for RSS/sitemap. Server-only.
 * - updated: business "last updated" date (shown in UI, editable in admin).
 * - updated_at: row metadata, set on insert/update; we use it for sitemap lastmod when updated is null.
 * Env: PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY; fallback: anon key if RLS allows public read.
 */
import { createClient } from '@supabase/supabase-js';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

export type NewsFeedItem = {
	slug: string;
	title: string;
	date: string;
	excerpt: string;
	updated?: string | null;
	updated_at?: string | null;
};

async function queryNewsPosts(limit: number): Promise<NewsFeedItem[]> {
	const url = publicEnv.PUBLIC_SUPABASE_URL;
	if (!url) return [];

	const run = async (key: string) => {
		const supabase = createClient(url, key);
		const { data, error } = await supabase
			.from('news_posts')
			.select('slug, title, date, updated, updated_at, excerpt')
			.eq('hidden', false)
			.order('date', { ascending: false })
			.limit(limit);
		return error ? null : (data ?? []);
	};

	const serviceKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY;
	if (serviceKey) {
		const data = await run(serviceKey);
		if (data?.length) return data as NewsFeedItem[];
	}
	const anonKey = publicEnv.PUBLIC_SUPABASE_ANON_KEY;
	if (anonKey) {
		const data = await run(anonKey);
		if (data?.length) return data as NewsFeedItem[];
	}
	return [];
}

export async function getNewsFeedItems(limit = 50): Promise<NewsFeedItem[]> {
	return queryNewsPosts(limit);
}
