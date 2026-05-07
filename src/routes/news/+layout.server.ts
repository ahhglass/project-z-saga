import { error, redirect } from '@sveltejs/kit';
import { filteredNews, getPostsFromDb, getFallbackPosts } from '$lib/data/news-posts';
import type { NewsPost } from '$lib/utils/types';

const PER_PAGE = 6;

export async function load({ url }: { url: URL }) {
	const pathname = url.pathname.replace(/\/$/, '');
	const segment = pathname === '/news' ? '' : pathname.replace(/^\/news\/?/, '').split('/')[0] ?? '';

	const dbPosts = await getPostsFromDb();
	const filePosts = filteredNews;
	const fallbackPosts = getFallbackPosts();
	const allPosts = dbPosts?.length ? dbPosts : filePosts.length ? filePosts : fallbackPosts;

	if (segment) {
		const post = dbPosts?.find((p) => p.slug === segment)
			?? filePosts.find((p) => p.slug === segment)
			?? fallbackPosts.find((p) => p.slug === segment);
		if (!post) throw error(404, 'News not found');
		return { post, posts: undefined as NewsPost[] | undefined };
	}

	let posts: NewsPost[] = allPosts;

	const sortParam = url.searchParams.get('sort') ?? 'newest';
	const sort = sortParam === 'oldest' || sortParam === 'title' ? sortParam : 'newest';

	if (sort === 'oldest') {
		posts = [...posts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
	} else if (sort === 'title') {
		posts = [...posts].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
	}
	// 'newest': default order (already newest first from DB/file)

	const pageParam = url.searchParams.get('page');
	const rawPage = parseInt(pageParam ?? '1', 10);
	const currentPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
	const totalPosts = posts.length;
	const totalPages = Math.max(1, Math.ceil(totalPosts / PER_PAGE));

	if (currentPage > totalPages && totalPages >= 1) {
		const params = new URLSearchParams();
		if (sort !== 'newest') params.set('sort', sort);
		if (totalPages > 1) params.set('page', String(totalPages));
		const q = params.toString();
		throw redirect(302, q ? `/news?${q}` : '/news');
	}

	const start = (currentPage - 1) * PER_PAGE;
	const pagePosts = posts.slice(start, start + PER_PAGE);

	return {
		post: undefined,
		posts: pagePosts,
		totalPosts,
		totalPages,
		currentPage,
		sort
	};
}
