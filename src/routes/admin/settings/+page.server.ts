import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getSupabaseServer } from '$lib/supabaseServer';
import type { SiteSettings } from '../../+layout.server';
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

export const load: PageServerLoad = async () => {
	try {
		const supabase = getSupabaseServer();
		const { data, error } = await supabase.from('site_settings').select('key, value');
		if (error || !data?.length) {
			return { settings: null as SiteSettings | null };
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

export const actions: Actions = {
	save: async ({ request }) => {
		const form = await request.formData();
		const supabase = getSupabaseServer();
		const keys = [
			'site_base_url',
			'site_title',
			'site_description',
			'site_keywords',
			'site_image',
			'server_ip',
			'hero_title',
			'hero_subtitle',
			'about_heading',
			'about_text',
			'about_image',
			'about_highlight',
			'footer_team_label',
			'footer_team_url',
			'footer_slogan',
			'footer_disclaimer',
			'social_links'
		] as const;
		const now = new Date().toISOString();
		for (const key of keys) {
			const value = String(form.get(key) ?? '').trim();
			const { error } = await supabase
				.from('site_settings')
				.upsert({ key, value, updated_at: now }, { onConflict: 'key' });
			if (error) {
				return fail(500, { saveError: error.message });
			}
		}
		return { saveSuccess: true };
	}
};
