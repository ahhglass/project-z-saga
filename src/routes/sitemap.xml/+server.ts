import { getSupabaseServer } from '$lib/supabaseServer';
import { getNewsFeedItems } from '$lib/data/news-feed';
import { siteBaseUrl } from '$lib/data/meta';

const xml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export async function GET() {
	let base = siteBaseUrl.replace(/\/$/, '');
	try {
		const supabase = getSupabaseServer();
		const { data } = await supabase.from('site_settings').select('key, value');
		if (data?.length) {
			const m = Object.fromEntries((data as { key: string; value: string }[]).map((r) => [r.key, r.value]));
			const url = (m.site_base_url ?? '').trim().replace(/\/$/, '');
			if (url) base = url;
		}
	} catch {
		// keep fallback
	}

	const staticUrls = [
		{ loc: `${base}/`, priority: '1.0', changefreq: 'weekly' },
		{ loc: `${base}/news`, priority: '0.9', changefreq: 'daily' },
		{ loc: `${base}/team`, priority: '0.8', changefreq: 'monthly' },
		{ loc: `${base}/faq`, priority: '0.8', changefreq: 'monthly' }
	];
	const newsItems = await getNewsFeedItems();
	const newsUrls = newsItems.map((p) => ({
		loc: `${base}/news/${p.slug}`,
		lastmod: (p.updated ?? p.updated_at ?? p.date).slice(0, 10),
		priority: '0.7',
		changefreq: 'monthly' as const
	}));

	const urlNodes = [
		...staticUrls.map(
			(u) => `  <url><loc>${xml(u.loc)}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
		),
		...newsUrls.map(
			(u) =>
				`  <url><loc>${xml(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
		)
	].join('\n');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>`,
		{
			headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
		}
	);
}
