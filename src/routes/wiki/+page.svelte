<script lang="ts">
	import { sound } from '$lib/utils/sound';
	import { title as defaultTitle } from '$lib/data/meta';
	import type { SiteSettings } from '../+layout.server';
	import type { WikiCategory, WikiArticle } from '$lib/data/wiki';

	interface Props {
		data: {
			settings?: SiteSettings | null;
			categories: WikiCategory[];
			articles: WikiArticle[];
		};
	}

	let { data }: Props = $props();

	const siteTitle = $derived(data?.settings?.site_title ?? defaultTitle);
	const categories = $derived(data?.categories ?? []);
	const articles = $derived(data?.articles ?? []);

	const countFor = (id: string) => articles.filter((a) => a.categoryId === id).length;
</script>

<svelte:head>
	<title>Wiki — {siteTitle}</title>
	<meta
		name="description"
		content="Project Z Saga wiki: mechanics, races, trainers, dungeons, and more."
	/>
</svelte:head>

<div class="wiki-hub">
	<p class="wiki-hub__label">DOCUMENTATION</p>
	<h1 class="wiki-hub__title">Wiki</h1>
	<p class="wiki-hub__intro">Gameplay reference: mechanics, races, dungeons, and other topics grouped by category.</p>

	<div class="wiki-hub__grid">
		{#each categories as cat}
			<a href="/wiki/{cat.id}" class="wiki-card" use:sound data-sveltekit-preload-data="off">
				<h2 class="wiki-card__title">{cat.title}</h2>
				<p class="wiki-card__desc">{cat.description}</p>
				<span class="wiki-card__meta">{countFor(cat.id)} article{countFor(cat.id) === 1 ? '' : 's'}</span>
				<span class="wiki-card__cta">Open category →</span>
			</a>
		{/each}
	</div>
</div>

<style lang="scss">
	@use '$lib/scss/breakpoints' as *;
	@use '$lib/scss/fluid' as *;

	.wiki-hub__label {
		font-size: 0.75rem;
		letter-spacing: 0.15em;
		color: var(--color--text-shade);
		margin: 0 0 8px;
	}

	.wiki-hub__title {
		font-family: var(--font--title);
		font-weight: 700;
		color: var(--color--text);
		margin: 0 0 12px;
		@include fluid-text(1.75rem, 2.25rem);
	}

	.wiki-hub__intro {
		color: var(--color--text-shade);
		max-width: 52ch;
		margin: 0 0 28px;
		line-height: 1.55;
		@include fluid-text(0.9375rem, 1.0625rem);
	}

	.wiki-hub__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 16px;

		@include for-phone-only {
			grid-template-columns: 1fr;
		}
	}

	.wiki-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		text-decoration: none;
		color: inherit;
		padding: 18px 16px;
		border-radius: 8px;
		border: 1px solid var(--color--code-inline-background);
		background: var(--color--team-card-bg, rgba(0, 0, 0, 0.04));
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease,
			transform 0.15s ease;

		&:hover {
			border-color: var(--color--primary);
			box-shadow: 0 4px 20px rgba(var(--color--primary-rgb, 54, 172, 48), 0.12);
			transform: translateY(-1px);
		}
	}

	.wiki-card__title {
		font-size: 1.0625rem;
		font-weight: 700;
		margin: 0 0 8px;
		color: var(--color--text);
	}

	.wiki-card__desc {
		font-size: 0.875rem;
		color: var(--color--text-shade);
		margin: 0 0 12px;
		line-height: 1.45;
		flex: 1;
	}

	.wiki-card__meta {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color--text-shade);
		margin-bottom: 8px;
	}

	.wiki-card__cta {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color--primary);
	}

</style>
