import { getSupabaseServer } from '$lib/supabaseServer';
import { rowToWikiArticle, type WikiRow } from './fromSupabase';
import type { WikiArticle } from './types';
import { loadWikiCategories } from './loadWikiCategories';

export async function getWikiArticlesFromDb(): Promise<WikiArticle[] | null> {
	try {
		const categories = await loadWikiCategories();
		const allowed = new Set(categories.map((c) => c.id));
		const supabase = getSupabaseServer();
		const { data, error } = await supabase
			.from('wiki_articles')
			.select('slug, title, category_id, body, excerpt, sort_order, hidden, updated_at')
			.eq('hidden', false)
			.order('category_id', { ascending: true })
			.order('sort_order', { ascending: true });
		if (error || !data?.length) return null;
		const rows = data as WikiRow[];
		const out: WikiArticle[] = [];
		for (const r of rows) {
			try {
				out.push(rowToWikiArticle(r, allowed));
			} catch {
				// skip rows whose category was removed from the tree
			}
		}
		return out.length ? out : null;
	} catch {
		return null;
	}
}
