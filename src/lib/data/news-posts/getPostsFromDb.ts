import { getSupabaseServer } from '$lib/supabaseServer';
import { rowToPost, getRelatedFromRows, type NewsRow } from '$lib/data/news-posts/fromSupabase';
import type { NewsPost } from '$lib/utils/types';

/**
 * Fetch public news posts from Supabase (non-hidden, newest first).
 * Returns null on error. Requires PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env (e.g. Vercel).
 */
export async function getPostsFromDb(): Promise<NewsPost[] | null> {
	try {
		const supabase = getSupabaseServer();
		const { data, error } = await supabase
			.from('news_posts')
			.select('slug, title, date, updated, excerpt, body, cover_image, tags, hidden')
			.eq('hidden', false)
			.order('date', { ascending: false });
		if (error || !data?.length) return null;
		const rows = data as NewsRow[];
		const out: NewsPost[] = [];
		for (const r of rows) {
			try {
				out.push(rowToPost(r, getRelatedFromRows(rows, r)));
			} catch {
				// skip rows that fail to map (e.g. bad body)
			}
		}
		return out.length ? out : null;
	} catch {
		return null;
	}
}
