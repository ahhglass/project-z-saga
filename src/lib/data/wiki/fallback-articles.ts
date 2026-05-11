import { parse as parseMarkdown } from 'marked';
import { embedVideoLinks } from '$lib/utils/embedVideoLinks';
import type { WikiArticle } from './types';
import { WIKI_SEED_ENTRIES } from './wiki-seed-entries';

function mdToArticle(params: {
	slug: string;
	title: string;
	categoryId: (typeof WIKI_SEED_ENTRIES)[number]['categoryId'];
	excerpt: string;
	bodyMarkdown: string;
	sortOrder: number;
}): WikiArticle {
	let html = parseMarkdown(params.bodyMarkdown, { async: false }) as string;
	html = embedVideoLinks(html);
	return {
		slug: params.slug,
		title: params.title,
		categoryId: params.categoryId,
		excerpt: params.excerpt,
		html,
		sortOrder: params.sortOrder,
		updatedAt: undefined
	};
}

export const FALLBACK_WIKI_ARTICLES: WikiArticle[] = WIKI_SEED_ENTRIES.map((e) =>
	mdToArticle({
		slug: e.slug,
		title: e.title,
		categoryId: e.categoryId,
		excerpt: e.excerpt,
		bodyMarkdown: e.bodyMarkdown,
		sortOrder: e.sortOrder
	})
);
