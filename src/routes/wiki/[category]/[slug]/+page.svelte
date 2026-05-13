<script lang="ts">
	import { sound } from '$lib/utils/sound';
	import { title as defaultTitle } from '$lib/data/meta';
	import type { SiteSettings } from '../../../+layout.server';
	import type { WikiArticle, WikiCategory } from '$lib/data/wiki';

	interface Props {
		data: {
			settings?: SiteSettings | null;
			category: WikiCategory;
			article: WikiArticle;
		};
	}

	let { data }: Props = $props();

	const siteTitle = $derived(data?.settings?.site_title ?? defaultTitle);
	const cat = $derived(data.category);
	const article = $derived(data.article);
	const html = $derived(article.html ?? '');
</script>

<svelte:head>
	<title>{article.title} — {cat.title} — Wiki — {siteTitle}</title>
	<meta name="description" content={article.excerpt} />
</svelte:head>

<div class="wiki-article-page">
	<nav class="wiki-breadcrumb" aria-label="Breadcrumb">
		<a href="/wiki" use:sound>Wiki</a>
		<span aria-hidden="true" class="wiki-breadcrumb__sep"> / </span>
		<a href="/wiki/{cat.id}" use:sound>{cat.title}</a>
		<span aria-hidden="true" class="wiki-breadcrumb__sep"> / </span>
		<span class="wiki-breadcrumb__here">{article.title}</span>
	</nav>

	<article class="wiki-article" aria-labelledby="wiki-article-title">
		<header class="wiki-article__header">
			<h1 id="wiki-article-title" class="wiki-article__title">{article.title}</h1>
			{#if article.updatedAt}
				<p class="wiki-article__updated">Updated {article.updatedAt.slice(0, 10)}</p>
			{/if}
		</header>
		<div class="wiki-article__body md-content">
			{@html html}
		</div>
	</article>
</div>

<style lang="scss">
	@use '$lib/scss/fluid' as *;

	.wiki-breadcrumb {
		@include fluid-text(0.75rem, 0.9375rem);
		color: var(--color--text-shade);
		margin-bottom: 20px;

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

	.wiki-article__title {
		font-family: var(--font--title);
		font-weight: 700;
		color: var(--color--text);
		margin: 0 0 8px;
		@include fluid-text(1rem, 2.515rem);
	}

	.wiki-article__updated {
		@include fluid-text(0.6rem, 0.8125rem);
		color: var(--color--text-shade);
		margin: 0 0 24px;
	}

	.wiki-article__body {
		word-wrap: break-word;
		@include fluid-text(0.65rem, 1.445rem);
		line-height: 1.55;
	}

	.wiki-article__body :global(h2),
	.wiki-article__body :global(h3) {
		margin-top: 1.5em;
		margin-bottom: 0.5em;
		font-weight: 600;
	}
	.wiki-article__body :global(h2) {
		@include fluid-text(1.1rem, 2.448rem);
	}
	.wiki-article__body :global(h3) {
		@include fluid-text(0.8rem, 1.632rem);
	}
	.wiki-article__body :global(p) {
		margin-bottom: 1em;
		@include fluid-text(0.75rem, 1.445rem);
		line-height: 1.55;
	}
	.wiki-article__body :global(li) {
		margin: 0.35em 0;
		@include fluid-text(0.75rem, 1.445rem);
		line-height: 1.55;
	}
	.wiki-article__body :global(ul),
	.wiki-article__body :global(ol) {
		margin-bottom: 1em;
		padding-left: 1.5em;
	}
	.wiki-article__body :global(a) {
		color: var(--color--primary);
	}
	.wiki-article__body :global(code) {
		font-family: var(--font--mono);
		background: var(--color--code-inline-background);
		padding: 0.15em 0.4em;
		border-radius: 4px;
		@include fluid-text(0.65rem, 1.275rem);
	}
	.wiki-article__body :global(pre) {
		overflow-x: auto;
		padding: 1rem;
		background: var(--color--code-inline-background);
		border-radius: 8px;
		margin-bottom: 1em;
		font-family: var(--font--mono);
		@include fluid-text(0.65rem, 1.275rem);
	}
</style>
