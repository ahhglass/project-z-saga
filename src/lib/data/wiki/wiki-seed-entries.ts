import type { WikiCategoryId } from './types';

export type WikiSeedEntry = {
	slug: string;
	title: string;
	categoryId: WikiCategoryId;
	excerpt: string;
	bodyMarkdown: string;
	sortOrder: number;
};

export const WIKI_SEED_ENTRIES: WikiSeedEntry[] = [
	{
		slug: 'overview',
		title: 'Overview',
		categoryId: 'general-mechanics',
		excerpt: 'Basics of how progression, ki, and world rules fit together.',
		bodyMarkdown: `## General mechanics

Explore **progression**, **combat flow**, ki systems, and the shared rules that shape every encounter.

Topics in this hub focus on “how things work,” not lore spoilers.`,
		sortOrder: 0
	},
	{
		slug: 'overview',
		title: 'Overview',
		categoryId: 'player-races',
		excerpt: 'How races shape your toolkit and progression.',
		bodyMarkdown: `## Player races

Pick a lineage that fits your fantasy. Different races emphasize **distinct strengths**, transformations, and passives.

Dig into comparisons here before you dedicate your skill points.`,
		sortOrder: 0
	},
	{
		slug: 'overview',
		title: 'Overview',
		categoryId: 'trainers',
		excerpt: 'Where to train and specialize.',
		bodyMarkdown: `## Trainers

Track down mentors who **unlock techniques**, branching paths, and focused builds.`,
		sortOrder: 0
	},
	{
		slug: 'overview',
		title: 'Overview',
		categoryId: 'space',
		excerpt: 'Warp travel, hubs, and what lies between worlds.',
		bodyMarkdown: `## Space

Chart **warp routes**, key hubs, and the regions worth mapping first.`,
		sortOrder: 0
	},
	{
		slug: 'overview',
		title: 'Overview',
		categoryId: 'cosmetics',
		excerpt: 'Dress loud without gaining power.',
		bodyMarkdown: `## Cosmetics

Earn **looks, flair, and callouts** that never touch combat numbers.`,
		sortOrder: 0
	},
	{
		slug: 'overview',
		title: 'Overview',
		categoryId: 'technology',
		excerpt: 'Items, rigs, and world tech worth knowing.',
		bodyMarkdown: `## Technology

Notes on gadgets, scanners, relics, and other **interactive systems**.`,
		sortOrder: 0
	},
	{
		slug: 'overview',
		title: 'Overview',
		categoryId: 'dungeon-info',
		excerpt: 'Briefing rooms for instanced runs.',
		bodyMarkdown: `## Dungeons

Prep for modifiers, checkpoints, bosses, and the loot rotations each instance emphasizes.`,
		sortOrder: 0
	}
];
