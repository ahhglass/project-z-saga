import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { loadWikiArticles, loadWikiCategories, isValidWikiCategoryId } from '$lib/data/wiki';

export const load: PageServerLoad = async ({ params }) => {
	const { category } = params;
	if (!isValidWikiCategoryId(category)) {
		throw error(404, 'Unknown wiki category');
	}
	const categories = await loadWikiCategories();
	const cat = categories.find((c) => c.id === category);
	if (!cat) throw error(404, 'Unknown wiki category');

	const articles = await loadWikiArticles();
	const inCategory = articles
		.filter((a) => a.categoryId === category)
		.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

	return { category: cat, articlesInCategory: inCategory };
};
