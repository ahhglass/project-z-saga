import { siteBaseUrl } from '$lib/data/meta';
import { getSupabaseServer } from '$lib/supabaseServer';

export async function GET() {
	let base = siteBaseUrl.replace(/\/$/, '');
	try {
		const supabase = getSupabaseServer();
		const { data } = await supabase.from('site_settings').select('key, value');
		if (data?.length) {
			const map = Object.fromEntries((data as { key: string; value: string }[]).map((r) => [r.key, r.value]));
			const url = (map.site_base_url ?? '').trim().replace(/\/$/, '');
			if (url) base = url;
		}
	} catch {
		// keep meta fallback
	}
	const body = `# Allow crawling everything by default
User-agent: *
Allow: /

# Sitemap
Sitemap: ${base}/sitemap.xml
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=86400'
		}
	});
}
