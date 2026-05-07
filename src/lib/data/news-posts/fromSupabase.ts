import { parse as parseMarkdown } from 'marked';
import readingTime from 'reading-time/lib/reading-time';
import { embedVideoLinks } from '$lib/utils/embedVideoLinks';
import type { NewsPost } from '$lib/utils/types';

export type NewsRow = {
	slug: string;
	title: string;
	date: string;
	updated: string | null;
	excerpt: string;
	body: string;
	cover_image: string | null;
	tags: string[] | null;
	hidden: boolean;
};

/** Convert DB row to NewsPost; body (markdown) -> html, with YouTube/TikTok links as embeds */
export function rowToPost(row: NewsRow, relatedPosts: NewsPost[] = []): NewsPost {
	let html = row.body ? (parseMarkdown(row.body, { async: false }) as string) : '';
	html = embedVideoLinks(html);
	const readingTimeResult = row.excerpt ? readingTime(row.excerpt) : undefined;
	return {
		slug: row.slug,
		title: row.title,
		date: row.date,
		updated: row.updated ?? undefined,
		excerpt: row.excerpt,
		html,
		readingTime: readingTimeResult ? readingTimeResult.text : '',
		relatedPosts,
		coverImage: row.cover_image ?? undefined,
		tags: row.tags ?? undefined,
		hidden: row.hidden
	};
}

/** Get related posts by shared tags (for rowToPost) */
export function getRelatedFromRows(rows: NewsRow[], current: NewsRow, limit = 3): NewsPost[] {
	const currentTags = current.tags ?? [];
	const related = rows
		.filter((r) => r.slug !== current.slug)
		.sort((a, b) => {
			const aTags = (a.tags ?? []).filter((t) => currentTags.includes(t)).length;
			const bTags = (b.tags ?? []).filter((t) => currentTags.includes(t)).length;
			return bTags - aTags;
		})
		.slice(0, limit);
	return related.map((r) => rowToPost(r, []));
}
