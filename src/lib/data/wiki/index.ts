import { getWikiArticlesFromDb } from './getWikiArticlesFromDb';
import { FALLBACK_WIKI_ARTICLES } from './fallback-articles';
import type { WikiArticle } from './types';
import { invalidateWikiCategoriesCache, loadWikiCategories } from './loadWikiCategories';

export type { WikiCategory, WikiCategoryId, WikiArticle } from './types';
export {
	wikiDefaultCategories,
	isValidWikiCategoryId,
	WIKI_CATEGORY_ID_PATTERN
} from './categories';
export { WIKI_SEED_ENTRIES } from './wiki-seed-entries';
export { loadWikiCategories } from './loadWikiCategories';

const WIKI_CACHE_MS = 60_000;
let wikiCache: { data: WikiArticle[]; until: number } | null = null;

export function invalidateWikiArticlesCache(): void {
	wikiCache = null;
	invalidateWikiCategoriesCache();
}

export async function loadWikiArticles(): Promise<WikiArticle[]> {
	const now = Date.now();
	if (wikiCache && now < wikiCache.until) return wikiCache.data;

	const db = await getWikiArticlesFromDb();
	let merged: WikiArticle[];
	if (!db?.length) {
		merged = FALLBACK_WIKI_ARTICLES;
	} else {
		const categories = await loadWikiCategories();
		const allowed = new Set(categories.map((c) => c.id));
		const withDbContent = new Set(db.map((a) => a.categoryId));
		merged = [...db];
		for (const stub of FALLBACK_WIKI_ARTICLES) {
			if (!allowed.has(stub.categoryId)) continue;
			if (!withDbContent.has(stub.categoryId)) merged.push(stub);
		}
	}

	wikiCache = { data: merged, until: now + WIKI_CACHE_MS };
	return merged;
}
