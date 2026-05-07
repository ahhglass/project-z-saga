import type { LayoutServerLoad } from './$types';
import { getSupabaseServer } from '$lib/supabaseServer';
import type { SocialLinkItem } from '$lib/utils/types';

function migrateSocialLinks(map: Record<string, string>): string {
	const raw = map.social_links?.trim();
	if (raw) return raw;
	const items: SocialLinkItem[] = [];
	const add = (icon: string, url: string) => {
		if (url?.trim()) items.push({ label: icon, url: url.trim(), icon });
	};
	add('telegram', map.social_telegram);
	add('x', map.social_x);
	add('github', map.social_github);
	add('email', map.social_email);
	add('linkedin', map.social_linkedin);
	return items.length ? JSON.stringify(items) : '[]';
}

export type SiteSettings = {
	site_base_url: string;
	site_title: string;
	site_description: string;
	site_keywords: string;
	site_image: string;
	server_ip: string;
	hero_title: string;
	hero_subtitle: string;
	// About block (home)
	about_heading: string;
	about_text: string;
	about_image: string;
	/** Phrase from heading to wrap in sparkle (must appear in about_heading). */
	about_highlight: string;
	// Footer
	footer_team_label: string;
	footer_team_url: string;
	/** Second line of copyright after team link. */
	footer_slogan: string;
	footer_disclaimer: string;
	// Social links: JSON array [{ label, url, icon }], icon: telegram|x|github|email|linkedin|discord|mastodon|link
	social_links: string;
};

export const load: LayoutServerLoad = async () => {
	try {
		const supabase = getSupabaseServer();
		const { data, error } = await supabase.from('site_settings').select('key, value');
		if (error || !data?.length) {
			return { settings: null };
		}
		const map = Object.fromEntries((data as { key: string; value: string }[]).map((r) => [r.key, r.value]));
		const settings: SiteSettings = {
			site_base_url: map.site_base_url ?? '',
			site_title: map.site_title ?? '',
			site_description: map.site_description ?? '',
			site_keywords: map.site_keywords ?? '[]',
			site_image: map.site_image ?? '',
			server_ip: map.server_ip ?? '',
			hero_title: map.hero_title ?? '',
			hero_subtitle: map.hero_subtitle ?? '',
			about_heading: map.about_heading ?? '',
			about_text: map.about_text ?? '',
			about_image: map.about_image ?? '',
			about_highlight: map.about_highlight ?? '',
			footer_team_label: map.footer_team_label ?? '',
			footer_team_url: map.footer_team_url ?? '',
			footer_slogan: map.footer_slogan ?? '',
			footer_disclaimer: map.footer_disclaimer ?? '',
			social_links: migrateSocialLinks(map)
		};
		return { settings };
	} catch {
		return { settings: null };
	}
};
