/**
 * Replaces standalone YouTube and TikTok links in HTML with responsive embeds.
 * Detects links in paragraphs (e.g. from markdown) and turns them into iframe players.
 */

/** Result of parsing a cover/media URL as YouTube or TikTok. */
export type VideoCoverInfo =
	| { type: 'youtube'; videoId: string }
	| { type: 'tiktok'; videoId: string };

const YOUTUBE_URL =
	/^(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+))(?:\?|$)/i;
const TIKTOK_URL =
	/^(https?:\/\/(?:www\.)?tiktok\.com\/@[^/]+\/video\/(\d+))(?:\?|$)/i;

/** YouTube thumbnail URL for preview/cover (e.g. in cards or admin). */
export function youtubeThumbUrl(videoId: string): string {
	return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * If the given URL is a YouTube or TikTok video link, returns embed info; otherwise null.
 * Use for cover image field: when user pastes a video URL, show video embed instead of image.
 */
export function parseVideoCoverUrl(url: string | undefined): VideoCoverInfo | null {
	if (!url || typeof url !== 'string') return null;
	const trimmed = url.trim();
	const yt = YOUTUBE_URL.exec(trimmed);
	if (yt) return { type: 'youtube', videoId: yt[2] };
	const tt = TIKTOK_URL.exec(trimmed);
	if (tt) return { type: 'tiktok', videoId: tt[2] };
	return null;
}

const YOUTUBE_PARA =
	/<p>\s*<a\s[^>]*href="(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+))[^"]*"[^>]*>[^<]*<\/a>\s*<\/p>/gi;
const TIKTOK_PARA =
	/<p>\s*<a\s[^>]*href="(https?:\/\/(?:www\.)?tiktok\.com\/@[^/]+\/video\/(\d+))[^"]*"[^>]*>[^<]*<\/a>\s*<\/p>/gi;

function youtubeEmbed(_match: string, _url: string, videoId: string): string {
	return `<div class="video-embed video-embed--youtube"><div class="video-embed__wrapper"><iframe title="YouTube video" src="https://www.youtube.com/embed/${videoId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div></div>`;
}

function tiktokEmbed(_match: string, _url: string, postId: string): string {
	return `<div class="video-embed video-embed--tiktok"><div class="video-embed__wrapper"><iframe title="TikTok video" src="https://www.tiktok.com/player/v1/${postId}" allow="fullscreen" loading="lazy"></iframe></div></div>`;
}

/**
 * Transform HTML string: replace paragraphs that contain only a YouTube or TikTok link
 * with responsive embed blocks (iframe). Other content is unchanged.
 */
export function embedVideoLinks(html: string): string {
	if (!html || typeof html !== 'string') return html;
	let out = html;
	out = out.replace(YOUTUBE_PARA, youtubeEmbed);
	out = out.replace(TIKTOK_PARA, tiktokEmbed);
	return out;
}
