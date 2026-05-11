import type { LayoutServerLoad } from './$types';
import { loadWikiArticles, loadWikiCategories, isValidWikiCategoryId } from '$lib/data/wiki';

export const load: LayoutServerLoad = async ({ url }) => {
	const articles = await loadWikiArticles();
	const categories = await loadWikiCategories();
	const parts = url.pathname.replace(/\/$/, '').split('/').filter(Boolean);
	const seg = parts[1] ?? '';
	const segmentCategory =
		isValidWikiCategoryId(seg) && categories.some((c) => c.id === seg) ? seg : '';
	const segmentArticle = parts[2] ?? '';

	return {
		categories,
		articles,
		currentCategoryId: segmentCategory || null,
		currentArticleSlug: segmentArticle || null
	};
};
