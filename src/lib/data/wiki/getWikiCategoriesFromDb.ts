import { getSupabaseServer } from '$lib/supabaseServer';

export type WikiCategoryRow = {
	id: string;
	title: string;
	description: string | null;
	sort_order: number;
};

/** Returns null if the table is missing or the query failed; [] if empty. */
export async function getWikiCategoriesFromDb(): Promise<WikiCategoryRow[] | null> {
	try {
		const supabase = getSupabaseServer();
		const { data, error } = await supabase
			.from('wiki_categories')
			.select('id, title, description, sort_order')
			.order('sort_order', { ascending: true })
			.order('title', { ascending: true });
		if (error) return null;
		return (data ?? []) as WikiCategoryRow[];
	} catch {
		return null;
	}
}
