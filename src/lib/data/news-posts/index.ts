import { filterNews, importNews } from './utils';

export const allNews = importNews();
export const filteredNews = filterNews(allNews);
export { getPostsFromDb } from './getPostsFromDb';
export { getFallbackPosts } from './fallback-posts';
