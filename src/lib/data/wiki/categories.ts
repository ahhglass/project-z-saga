import type { WikiCategory } from './types';

/** Built-in categories when `wiki_categories` is empty or unavailable. DB rows override by `id`. */
export const wikiDefaultCategories: WikiCategory[] = [
	{
		id: 'general-mechanics',
		title: 'General Mechanics',
		description: 'Core gameplay systems, progression, and how the world works.',
		sortOrder: 0
	},
	{
		id: 'player-races',
		title: 'Player Races',
		description: 'Races, bonuses, and how your choice shapes your build.',
		sortOrder: 10
	},
	{
		id: 'trainers',
		title: 'Trainers',
		description: 'NPCs, skill learning, and where to grow stronger.',
		sortOrder: 20
	},
	{
		id: 'space',
		title: 'Space',
		description: 'Travel, locations, and exploration beyond the surface.',
		sortOrder: 30
	},
	{
		id: 'cosmetics',
		title: 'Cosmetics',
		description: 'Looks, titles, and visual flair without affecting power.',
		sortOrder: 40
	},
	{
		id: 'technology',
		title: 'Technology',
		description: 'Systems, items, and tech that power the experience.',
		sortOrder: 50
	},
	{
		id: 'dungeon-info',
		title: 'Dungeon Info',
		description: 'Instanced challenges, bosses, and what to expect inside.',
		sortOrder: 60
	}
];
/** URL segment: lowercase slug with hyphens (matches article slug rules). */
export const WIKI_CATEGORY_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const isValidWikiCategoryId = (value: string): boolean =>
	value.length > 0 && value.length <= 120 && WIKI_CATEGORY_ID_PATTERN.test(value);
