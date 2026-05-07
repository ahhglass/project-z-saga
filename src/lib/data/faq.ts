/**
 * FAQ page data for Project Z Saga.
 */

export interface FaqItem {
	id: string;
	question: string;
	answer: string;
	tag: string;
}

export const faqItems: FaqItem[] = [
	{
		id: 'what-is',
		question: 'What is Project Z Saga?',
		answer:
			'Project Z Saga (PZS) is a custom, vanilla-based Minecraft MMORPG server inspired by Akira Toriyama\'s Dragon Ball universe. It features dynamic PvE combat with ki-based abilities, expansive exploration, immersive quests, themed races and techniques, and tournaments — all with no mods required.',
		tag: 'ABOUT'
	},
	{
		id: 'how-to-join',
		question: 'How do I join the server?',
		answer:
			'Join our Discord (discord.gg/Z63vRU8zkY) for the server IP and rules. The server is vanilla Minecraft — no mods or resource packs are required to play.',
		tag: 'JOINING'
	},
	{
		id: 'combat',
		question: 'What combat and abilities are there?',
		answer:
			'Fight through powerful enemies and bosses using custom techniques and ki-based abilities. Choose your race and unlock powerful techniques, transformations, and passives to aid your adventure.',
		tag: 'COMBAT'
	},
	{
		id: 'exploration',
		question: 'What can I explore?',
		answer:
			'Discover unique planets, zones, and regions crafted with deep lore and Dragon Ball–inspired themes. Quests go beyond fetch tasks with engaging lore, interactive dialogues, and moral choices that affect your journey.',
		tag: 'EXPLORATION'
	},
	{
		id: 'races',
		question: 'What races and techniques are available?',
		answer:
			'Themed races and techniques are at the core of PZS. Unlock transformations and passives as you progress. Compete in tournaments and events for amazing rewards and become a martial artist like no other.',
		tag: 'GAMEPLAY'
	},
	{
		id: 'official',
		question: 'Is this official Dragon Ball or Minecraft content?',
		answer:
			'No. This is a fan-made project. Dragon Ball © Bird Studio / Shueisha, etc. Minecraft © Mojang / Microsoft. We are not affiliated with the license holders.',
		tag: 'ABOUT'
	},
	{
		id: 'trailer',
		question: 'Where can I see gameplay?',
		answer:
			'Watch the trailer on YouTube and follow us on TikTok for sneak peeks and updates. Links are on the homepage and in our Discord.',
		tag: 'MEDIA'
	},
	{
		id: 'future',
		question: 'What is planned for the future?',
		answer:
			'We are constantly adding new content: techniques, transformations, quests, zones, and events. Join the Discord to stay updated and share feedback.',
		tag: 'UPDATES'
	}
];

/** All unique tags for the FAQ filter */
export const faqTags = [...new Set(faqItems.map((item) => item.tag))].sort();
