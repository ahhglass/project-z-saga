import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { loadWikiArticles, loadWikiCategories, isValidWikiCategoryId } from '$lib/data/wiki';

export const load: PageServerLoad = async ({ params }) => {
	const { category, slug } = params;
	if (!isValidWikiCategoryId(category)) {
		throw error(404, 'Unknown wiki category');
	}
	const categories = await loadWikiCategories();
	const cat = categories.find((c) => c.id === category);
	if (!cat) throw error(404, 'Unknown wiki category');

	const articles = await loadWikiArticles();
	const article = articles.find((a) => a.categoryId === category && a.slug === slug);
	if (!article) throw error(404, 'Article not found');

	return { category: cat, article };
};
