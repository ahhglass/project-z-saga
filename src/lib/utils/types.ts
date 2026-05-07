/** One social link: label (title), url, icon key. */
export type SocialLinkItem = { label: string; url: string; icon: string };

export const SOCIAL_ICON_KEYS = [
	'telegram',
	'x',
	'github',
	'email',
	'linkedin',
	'discord',
	'mastodon',
	'youtube',
	'tiktok',
	'curseforge',
	'rss',
	'link'
] as const;
export type SocialIconKey = (typeof SOCIAL_ICON_KEYS)[number];

/** For site: only items with non-empty URL. */
export function parseSocialLinks(json: string | undefined): SocialLinkItem[] {
	return parseSocialLinksAll(json).filter((x) => x.url.trim() !== '');
}

/** For admin: all items including empty URL (to show empty rows). */
export function parseSocialLinksAll(json: string | undefined): SocialLinkItem[] {
	if (!json?.trim()) return [];
	try {
		const arr = JSON.parse(json);
		if (!Array.isArray(arr)) return [];
		return arr
			.filter((x): x is { label?: string; url?: string; icon?: string } => x && typeof x === 'object')
			.map((x) => ({
				label: typeof x.label === 'string' ? x.label.trim() : '',
				url: typeof x.url === 'string' ? x.url : '',
				icon: (SOCIAL_ICON_KEYS as readonly string[]).includes(String(x.icon ?? '')) ? (x.icon as SocialIconKey) : 'link'
			}));
	} catch {
		return [];
	}
}

export type NewsPost = {
	slug: string;
	title: string;
	date: string;
	updated?: string;
	excerpt: string;
	html: string | undefined;
	readingTime: string;
	relatedPosts: NewsPost[];
	coverImage?: string;
	tags?: string[];
	keywords?: string[];
	hidden?: boolean;
};
