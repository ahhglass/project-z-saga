import type { NewsPost } from '$lib/utils/types';

/** Demo news shown when DB and .md posts are empty. */
export function getFallbackPosts(): NewsPost[] {
	const a: NewsPost = {
		slug: 'welcome-to-project-z-saga',
		title: 'Welcome to Project Z Saga',
		date: '2025-02-15',
		excerpt:
			'Project Z Saga is a Dragon Ball–inspired Minecraft MMORPG. Vanilla-friendly, with custom combat, ki techniques, races and tournaments. No mods required — join the saga!',
		html: `<p>We're excited to announce <strong>Project Z Saga</strong> (PZS): a Dragon Ball–inspired Minecraft MMORPG that runs on vanilla or near-vanilla servers.</p>
<h2>What is PZS?</h2>
<p>PZS adds ki-based combat, techniques, races and tournaments straight into your Minecraft world. No client mods — everything is designed to work with the vanilla experience.</p>
<h2>What's next?</h2>
<p>Follow our development updates here and on Discord. Stay tuned for server launch and early access.</p>`,
		readingTime: '1 min read',
		relatedPosts: [],
		tags: ['announcement', 'pzs']
	};

	const b: NewsPost = {
		slug: 'first-tournament-announcement',
		title: 'First Tournament: Ki Masters Cup',
		date: '2025-02-20',
		excerpt:
			'The first official PZS tournament — Ki Masters Cup — will test the best fighters. Sign-ups open soon. Prizes and rules will be announced next week.',
		html: `<p>The first official <strong>Ki Masters Cup</strong> is coming to Project Z Saga.</p>
<h2>Format</h2>
<p>Single-elimination bracket. Matches will be held on weekends. Exact schedule and server details will be posted once sign-ups open.</p>
<h2>Prizes</h2>
<p>Winners will receive in-game titles and exclusive cosmetics. More details soon.</p>
<p>Good luck, warriors!</p>`,
		readingTime: '1 min read',
		relatedPosts: [],
		tags: ['tournament', 'events']
	};

	const c: NewsPost = {
		slug: 'combat-system-overhaul',
		title: 'Combat System Overhaul — Ki & Combos',
		date: '2025-02-25',
		excerpt:
			'Ki charging, combo chains and new hit reactions are live. Combat feels closer to the anime: charge, dash, strike.',
		html: `<p>We've rolled out a major <strong>combat update</strong> for Project Z Saga.</p>
<h2>Ki Charging</h2>
<p>Hold to charge ki, release to unleash stronger attacks or techniques. Charge level affects damage and knockback.</p>
<h2>Combo Chains</h2>
<p>Land consecutive hits to build combo count. Higher combos unlock brief damage bonuses and special finishers.</p>
<h2>Hit Reactions</h2>
<p>Enemies now react to heavy hits with stagger and knockback. Boss-type NPCs have updated resistance values.</p>
<p>Try it on the test server and share feedback on Discord.</p>`,
		readingTime: '2 min read',
		relatedPosts: [],
		tags: ['update', 'combat']
	};

	const d: NewsPost = {
		slug: 'races-reveal-saiyan-namekian',
		title: 'Races Revealed: Saiyan & Namekian',
		date: '2025-03-01',
		excerpt:
			'Two playable races are in: Saiyan (higher attack, transformable) and Namekian (regen, support). More races planned.',
		html: `<p>Today we're revealing the first two <strong>playable races</strong> in PZS.</p>
<h2>Saiyan</h2>
<p>Higher base attack and access to transformation states. As you grow stronger, you can unlock forms that boost power at the cost of ki drain.</p>
<h2>Namekian</h2>
<p>Regeneration and support-oriented abilities. Great for team play and longer fights. Unique technique tree focused on healing and buffs.</p>
<h2>More to Come</h2>
<p>Human and other races are in the pipeline. Each race will have its own passives and technique options.</p>`,
		readingTime: '2 min read',
		relatedPosts: [],
		tags: ['races', 'announcement']
	};

	const e: NewsPost = {
		slug: 'discord-server-launch',
		title: 'Official Discord Server is Live',
		date: '2025-03-05',
		excerpt:
			'Join the official Project Z Saga Discord for news, LFG, bug reports and community events. Link in the FAQ.',
		html: `<p>The <strong>official Project Z Saga Discord</strong> is now open.</p>
<h2>What's There</h2>
<p>Announcements, patch notes, LFG channels, bug reports and suggestions. We also run community votes and occasional voice events.</p>
<h2>How to Join</h2>
<p>Use the &quot;Join Discord&quot; button on the site or grab the invite from the FAQ. See you there!</p>`,
		readingTime: '1 min read',
		relatedPosts: [],
		tags: ['community', 'discord']
	};

	const f: NewsPost = {
		slug: 'beginner-guide-ki-basics',
		title: 'Beginner Guide: Ki & Techniques',
		date: '2025-03-10',
		excerpt:
			'New to PZS? This guide covers ki bars, basic techniques, and how to unlock your first signature move.',
		html: `<p>A short <strong>beginner guide</strong> for anyone new to Project Z Saga.</p>
<h2>Ki Bar</h2>
<p>Your ki bar fills by dealing and taking damage, and over time. Use it for techniques and transformations.</p>
<h2>Basic Techniques</h2>
<p>Everyone starts with a simple ki blast and block. Complete early quests to unlock your first signature technique.</p>
<h2>Unlocking More</h2>
<p>Techniques are earned through quests, trainers and achievements. Save ki for the right moment in PvP or boss fights.</p>`,
		readingTime: '2 min read',
		relatedPosts: [],
		tags: ['guide', 'beginners']
	};

	const g: NewsPost = {
		slug: 'balance-patch-march-2025',
		title: 'Balance Patch — March 2025',
		date: '2025-03-15',
		excerpt:
			'Technique damage tweaks, race passive adjustments and tournament rule updates. Full changelog inside.',
		html: `<p><strong>Balance patch</strong> is live. Summary below.</p>
<h2>Techniques</h2>
<p>Several high-damage techniques had their ki cost or cooldown increased. Ki blast base damage slightly reduced to favour combo play.</p>
<h2>Races</h2>
<p>Saiyan transformation duration shortened; Namekian regen rate tuned for group content. More tuning in the next cycle.</p>
<h2>Tournament Rules</h2>
<p>Ki Masters Cup rules updated: no consumables in bracket, and a short grace period after loading into the arena.</p>
<p>Full changelog is on Discord.</p>`,
		readingTime: '2 min read',
		relatedPosts: [],
		tags: ['update', 'balance']
	};

	const h: NewsPost = {
		slug: 'community-spar-weekend',
		title: 'Community Spar Weekend — March 22–23',
		date: '2025-03-18',
		excerpt:
			'Open sparring event on the test server. No bracket, just friendly fights and feedback. All skill levels welcome.',
		html: `<p>We're hosting a <strong>Community Spar Weekend</strong> on March 22–23.</p>
<h2>Format</h2>
<p>No bracket — hop on the test server and challenge anyone. Organise matches in Discord or in-game.</p>
<h2>Goals</h2>
<p>Stress-test the combat build and gather feedback. All skill levels welcome; it's about fun and data for us.</p>
<h2>Times</h2>
<p>Test server will be up all weekend. Peak hours for organised matches: Saturday and Sunday afternoon (UTC).</p>`,
		readingTime: '1 min read',
		relatedPosts: [],
		tags: ['events', 'community']
	};

	const i: NewsPost = {
		slug: 'roadmap-2025',
		title: 'Roadmap 2025: Seasons & New Content',
		date: '2025-03-22',
		excerpt:
			'2025 roadmap: Ki Masters Cup, first season, new techniques and races. Server launch window to be announced.',
		html: `<p>Here's our <strong>2025 roadmap</strong> for Project Z Saga.</p>
<h2>Q2</h2>
<p>Ki Masters Cup tournament, first season with rankings, and a batch of new techniques. Server launch window announcement.</p>
<h2>Q3–Q4</h2>
<p>Additional races, story quests and world events. More tournaments and seasonal rewards.</p>
<p>Details may shift based on feedback and testing. Thank you for following the saga!</p>`,
		readingTime: '2 min read',
		relatedPosts: [],
		tags: ['announcement', 'roadmap']
	};

	const j: NewsPost = {
		slug: 'closed-beta-sign-ups',
		title: 'Closed Beta Sign-Ups Open',
		date: '2025-03-28',
		excerpt:
			'Closed beta will test server stability and late-game content. Sign up via the form; invites go out in April.',
		html: `<p><strong>Closed beta</strong> sign-ups are now open.</p>
<h2>What We're Testing</h2>
<p>Server stability, late-game techniques and race balance. Selected testers will get early access to the main server build.</p>
<h2>How to Sign Up</h2>
<p>Fill in the form linked in our Discord and on the website. We'll send invites in April. Spots are limited.</p>
<h2>Requirements</h2>
<p>You'll need a Minecraft Java account and Discord. We'll provide the server address and a short guide once you're in.</p>`,
		readingTime: '2 min read',
		relatedPosts: [],
		tags: ['beta', 'announcement']
	};

	return [j, i, h, g, f, e, d, c, b, a]; // newest first
}
