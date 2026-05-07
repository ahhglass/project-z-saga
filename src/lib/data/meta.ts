// Fallbacks when site_settings from DB are empty. Prefer DB (Admin → Settings).
/** Base URL when DB site_base_url is empty (canonical, og:url, sitemap). */
export const siteBaseUrl = 'https://project-z-saga.vercel.app/';

export const keywords: string[] = [
	'Project Z Saga',
	'PZS',
	'Dragon Ball',
	'Minecraft',
	'MMORPG',
	'vanilla',
	'ki',
	'techniques',
	'races',
	'tournaments'
];

export const description =
	'Project Z Saga (PZS) — a Dragon Ball–inspired Minecraft MMORPG. Custom combat, quests, races, techniques and tournaments. No mods required.';

/** Site name (used as suffix in page titles when no DB) */
export const title = 'Project Z Saga';

export const image = '';
