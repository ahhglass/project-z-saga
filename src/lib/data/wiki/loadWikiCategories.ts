import { wikiDefaultCategories } from './categories';
import { getWikiCategoriesFromDb } from './getWikiCategoriesFromDb';
import type { WikiCategory } from './types';

const WIKI_CACHE_MS = 60_000;
let categoriesCache: { data: WikiCategory[]; until: number } | null = null;

export function invalidateWikiCategoriesCache(): void {
	categoriesCache = null;
}

/** Merges built-in defaults with `wiki_categories` rows (DB wins on same `id`). */
export async function loadWikiCategories(): Promise<WikiCategory[]> {
	const now = Date.now();
	if (categoriesCache && now < categoriesCache.until) return categoriesCache.data;

	const db = await getWikiCategoriesFromDb();
	const map = new Map<string, WikiCategory>();
	for (const c of wikiDefaultCategories) {
		map.set(c.id, { ...c });
	}
	if (db !== null) {
		for (const r of db) {
			map.set(r.id, {
				id: r.id,
				title: r.title?.trim() || r.id,
				description: (r.description ?? '').trim(),
				sortOrder: Number.isFinite(r.sort_order) ? r.sort_order : 0
			});
		}
	}
	const merged = [...map.values()].sort(
		(a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
	);
	categoriesCache = { data: merged, until: now + WIKI_CACHE_MS };
	return merged;
}
