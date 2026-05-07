import readingTime from 'reading-time/lib/reading-time';
import type { NewsPost } from '$lib/utils/types';

/** Import news from .md files (like the blog template). Svelte 5 has no Component.render(), so we only use metadata. */
export const importNews = () => {
	const glob = import.meta.glob<{ metadata: Record<string, unknown> }>(
		'./../../../routes/news/*/+page.md',
		{ eager: true }
	);

	const posts: NewsPost[] = [];
	for (const path in glob) {
		const mod = glob[path];
		if (!mod) continue;
		const slug = path.replace(/^.*news\/([^/]+)\/\+page\.md$/, '$1');
		const meta = (mod as { metadata?: Record<string, unknown> }).metadata ?? {};
		posts.push({
			...meta,
			slug: (meta.slug as string) ?? slug
		} as NewsPost);
	}
	return posts;
};

export const filterNews = (posts: NewsPost[]) => {
	return posts
		.filter((post) => !post.hidden)
		.sort((a, b) =>
			new Date(a.date).getTime() > new Date(b.date).getTime()
				? -1
				: new Date(a.date).getTime() < new Date(b.date).getTime()
					? 1
					: 0
		)
		.map((post) => {
			// Svelte 5: no .render(), so estimate reading time from excerpt
			const readingTimeResult = post.excerpt ? readingTime(post.excerpt) : undefined;
			const relatedPosts = getRelatedPosts(posts, post);
			return {
				...post,
				readingTime: readingTimeResult ? readingTimeResult.text : '',
				relatedPosts
			} as NewsPost;
		});
};

function getRelatedPosts(posts: NewsPost[], post: NewsPost): NewsPost[] {
	const related = posts
		.filter((p) => !p.hidden && p.slug !== post.slug)
		.sort((a, b) => {
			const aTags = a.tags?.filter((t) => post.tags?.includes(t))?.length ?? 0;
			const bTags = b.tags?.filter((t) => post.tags?.includes(t))?.length ?? 0;
			return bTags - aTags;
		});
	return related.slice(0, 3).map((p) => ({
		...p,
		readingTime: p.excerpt ? readingTime(p.excerpt).text : ''
	}));
}
