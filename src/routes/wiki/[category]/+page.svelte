<script lang="ts">
	import { sound } from '$lib/utils/sound';
	import { title as defaultTitle } from '$lib/data/meta';
	import type { SiteSettings } from '../../+layout.server';
	import type { WikiArticle, WikiCategory } from '$lib/data/wiki';

	interface Props {
		data: {
			settings?: SiteSettings | null;
			category: WikiCategory;
			articlesInCategory: WikiArticle[];
		};
	}

	let { data }: Props = $props();

	const siteTitle = $derived(data?.settings?.site_title ?? defaultTitle);
	const cat = $derived(data.category);
	const list = $derived(data?.articlesInCategory ?? []);
</script>

<svelte:head>
	<title>{cat.title} — Wiki — {siteTitle}</title>
	<meta name="description" content={cat.description} />
</svelte:head>

<div class="wiki-category-page">
	<nav class="wiki-breadcrumb" aria-label="Breadcrumb">
		<a href="/wiki" use:sound>Wiki</a>
		<span aria-hidden="true" class="wiki-breadcrumb__sep"> / </span>
		<span class="wiki-breadcrumb__here">{cat.title}</span>
	</nav>

	<h1 class="wiki-category-page__title">{cat.title}</h1>
	<p class="wiki-category-page__desc">{cat.description}</p>

	<ul class="wiki-article-list">
		{#each list as article}
			<li>
				<a
					href="/wiki/{cat.id}/{article.slug}"
					class="wiki-article-list__link"
					use:sound
					data-sveltekit-preload-data="off"
				>
					<span class="wiki-article-list__name">{article.title}</span>
					<span class="wiki-article-list__excerpt">{article.excerpt}</span>
				</a>
			</li>
		{/each}
	</ul>

	{#if list.length === 0}
		<p class="wiki-empty">No articles in this category yet.</p>
	{/if}
</div>

<style lang="scss">
	@use '$lib/scss/fluid' as *;

	.wiki-breadcrumb {
		font-size: 0.875rem;
		color: var(--color--text-shade);
		margin-bottom: 16px;

		a {
			color: var(--color--primary);
			text-decoration: none;

			&:hover {
				text-decoration: underline;
			}
		}
	}

	.wiki-breadcrumb__sep {
		opacity: 0.7;
	}

	.wiki-breadcrumb__here {
		color: var(--color--text);
		font-weight: 500;
	}

	.wiki-category-page__title {
		font-family: var(--font--title);
		font-weight: 700;
		color: var(--color--text);
		margin: 0 0 10px;
		@include fluid-text(1.2rem, 2.72rem);
	}

	.wiki-category-page__desc {
		color: var(--color--text-shade);
		margin: 0 0 28px;
		max-width: 60ch;
		line-height: 1.5;
	}

	.wiki-article-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.wiki-article-list__link {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 14px 16px;
		border: 1px solid var(--color--code-inline-background);
		border-radius: 8px;
		text-decoration: none;
		color: inherit;
		background: var(--color--team-card-bg, rgba(0, 0, 0, 0.04));
		transition: border-color 0.2s ease, box-shadow 0.2s ease;

		&:hover {
			border-color: var(--color--primary);
		}
	}

	.wiki-article-list__name {
		font-weight: 600;
		color: var(--color--text);
	}

	.wiki-article-list__excerpt {
		font-size: 0.875rem;
		color: var(--color--text-shade);
		line-height: 1.4;
	}

	.wiki-empty {
		color: var(--color--text-shade);
	}
</style>
