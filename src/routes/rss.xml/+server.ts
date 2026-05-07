import { getSupabaseServer } from '$lib/supabaseServer';
import { getNewsFeedItems } from '$lib/data/news-feed';
import { siteBaseUrl, title as metaTitle, description as metaDesc } from '$lib/data/meta';

const xml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

async function siteMeta() {
	try {
		const supabase = getSupabaseServer();
		const { data } = await supabase.from('site_settings').select('key, value');
		if (!data?.length) return { base: siteBaseUrl.replace(/\/$/, ''), title: metaTitle, description: metaDesc };
		const m = Object.fromEntries((data as { key: string; value: string }[]).map((r) => [r.key, r.value]));
		return {
			base: (m.site_base_url ?? siteBaseUrl).replace(/\/$/, '') || siteBaseUrl.replace(/\/$/, ''),
			title: m.site_title ?? metaTitle,
			description: m.site_description ?? metaDesc
		};
	} catch {
		return { base: siteBaseUrl.replace(/\/$/, ''), title: metaTitle, description: metaDesc };
	}
}

export async function GET() {
	const { base, title, description } = await siteMeta();
	const items = await getNewsFeedItems(20);
	const itemXml = items
		.map(
			(p) =>
				`    <item>
      <title>${xml(p.title)}</title>
      <link>${base}/news/${xml(p.slug)}</link>
      <description>${xml(p.excerpt ?? '')}</description>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${base}/news/${xml(p.slug)}</guid>
    </item>`
		)
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(title || 'News')} — News</title>
    <link>${base}/news</link>
    <description>${xml(description || '')}</description>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>
${itemXml}
  </channel>
</rss>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=300'
		}
	});
}
