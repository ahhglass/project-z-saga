import { parse as parseMarkdown } from 'marked';
import { embedVideoLinks } from '$lib/utils/embedVideoLinks';
import type { WikiArticle } from './types';

export type WikiRow = {
	slug: string;
	title: string;
	category_id: string;
	body: string;
	excerpt: string | null;
	sort_order: number;
	hidden: boolean;
	updated_at: string | null;
};

export function rowToWikiArticle(row: WikiRow, allowedCategoryIds: Set<string>): WikiArticle {
	if (!allowedCategoryIds.has(row.category_id)) {
		throw new Error(`Unknown wiki category_id: ${row.category_id}`);
	}
	let html = row.body ? (parseMarkdown(row.body, { async: false }) as string) : '';
	html = embedVideoLinks(html);
	return {
		slug: row.slug,
		title: row.title,
		categoryId: row.category_id,
		excerpt: (row.excerpt ?? '').trim() || row.title,
		html,
		sortOrder: row.sort_order ?? 0,
		updatedAt: row.updated_at ?? undefined
	};
}
