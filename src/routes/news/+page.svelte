<script lang="ts">
	import { onMount } from 'svelte';
	import NewsCard from '$blocks/NewsCard.svelte';
	import type { SiteSettings } from '../+layout.server';
	import { NavArrowLeft, NavArrowRight, SortUp, SortDown, Sort } from '$lib/icons';
	import type { NewsPost } from '$lib/utils/types';
	import { title as defaultTitle } from '$lib/data/meta';

	type SortMode = 'newest' | 'oldest' | 'title';

	interface Props {
		data: {
			settings?: SiteSettings | null;
			posts?: NewsPost[];
			totalPages?: number;
			currentPage?: number;
			sort?: SortMode;
		};
	}

	let { data }: Props = $props();

	const siteTitle = $derived(data?.settings?.site_title ?? defaultTitle);
	const currentSort = $derived((data?.sort ?? 'newest') as SortMode);

	const posts = $derived(data?.posts ?? []);
	const totalPages = $derived(data?.totalPages ?? 1);
	const currentPage = $derived(data?.currentPage ?? 1);

	// CSS animation runs after hydration (Svelte transitions don't fire on SSR)
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});

	function pageUrl(page: number): string {
		const params = new URLSearchParams();
		if (currentSort !== 'newest') params.set('sort', currentSort);
		if (page > 1) params.set('page', String(page));
		const q = params.toString();
		return q ? `/news?${q}` : '/news';
	}

	function sortUrl(sort: SortMode): string {
		const params = new URLSearchParams();
		if (sort !== 'newest') params.set('sort', sort);
		const q = params.toString();
		return q ? `/news?${q}` : '/news';
	}

	// Show at most 4 page numbers in each block: 1 2 3 4 … 10 or 1 … 7 8 9 10
	function visiblePages(): number[] {
		const total = totalPages;
		if (total <= 4) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}
		const cur = currentPage;
		const show: number[] = [];
		if (cur <= 3) {
			for (let i = 1; i <= 4; i++) show.push(i);
			show.push(-1); // ellipsis
			show.push(total);
		} else if (cur >= total - 2) {
			show.push(1);
			show.push(-1);
			for (let i = total - 3; i <= total; i++) show.push(i);
		} else {
			show.push(1);
			show.push(-1);
			for (let i = cur - 1; i <= cur + 1; i++) show.push(i);
			show.push(-1);
			show.push(total);
		}
		return show;
	}
</script>

<svelte:head>
	<title>News — {siteTitle}</title>
</svelte:head>

<div class="news-page">
	<header class="news-header mc-card">
		<p class="label">LATEST NEWS</p>
		<h1 class="page-title">News</h1>
	</header>

	{#if posts.length || totalPages > 0}
		<nav class="sort-controls" aria-label="Sort news">
			<a
				class="sort-btn mc-button mc-button-normal"
				class:active={currentSort === 'newest'}
				href={sortUrl('newest')}
			>
				<span class="sort-btn-icon" aria-hidden="true"><SortUp /></span>
				Newest
			</a>
			<a
				class="sort-btn mc-button mc-button-normal"
				class:active={currentSort === 'oldest'}
				href={sortUrl('oldest')}
			>
				<span class="sort-btn-icon" aria-hidden="true"><SortDown /></span>
				Oldest
			</a>
			<a
				class="sort-btn mc-button mc-button-normal"
				class:active={currentSort === 'title'}
				href={sortUrl('title')}
			>
				<span class="sort-btn-icon" aria-hidden="true"><Sort /></span>
				By Title
			</a>
		</nav>
	{/if}

	{#if posts.length}
		<div class="news-grid" class:mounted>
			{#each posts as post, i}
				<div class="card-item" style="--i: {i}">
					<NewsCard
						title={post.title}
						excerpt={post.excerpt}
						slug={post.slug}
						readingTime={post.readingTime}
						tags={post.tags}
						coverImage={post.coverImage}
						showImage={true}
					/>
				</div>
			{/each}
		</div>
		{#if totalPages > 1}
			<nav class="pagination" aria-label="Pagination">
				{#if currentPage > 1}
					<a class="pagination-link prev" href={pageUrl(currentPage - 1)} aria-label="Previous page">
						<span class="pagination-icon"><NavArrowLeft /></span>
					</a>
				{:else}
					<span class="pagination-link prev disabled" aria-disabled="true" aria-label="Previous page">
						<span class="pagination-icon"><NavArrowLeft /></span>
					</span>
				{/if}
				<span class="pagination-pages">
					{#each visiblePages() as p}
						{#if p === -1}
							<span class="pagination-ellipsis" aria-hidden="true">…</span>
						{:else if p === currentPage}
							<span class="pagination-link current" aria-current="page">{p}</span>
						{:else}
							<a class="pagination-link" href={pageUrl(p)}>{p}</a>
						{/if}
					{/each}
				</span>
				{#if currentPage < totalPages}
					<a class="pagination-link next" href={pageUrl(currentPage + 1)} aria-label="Next page">
						<span class="pagination-icon"><NavArrowRight /></span>
					</a>
				{:else}
					<span class="pagination-link next disabled" aria-disabled="true" aria-label="Next page">
						<span class="pagination-icon"><NavArrowRight /></span>
					</span>
				{/if}
			</nav>
		{/if}
	{:else}
		<p class="empty">No news yet.</p>
	{/if}
</div>

<style lang="scss">
	@use '$lib/scss/breakpoints' as *;
	@use '$lib/scss/fluid' as *;

	.news-page {
		width: 100%;
	}

	.sort-controls {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
		margin-bottom: 28px;

		@include for-phone-only {
			gap: 6px;
			margin-bottom: 20px;
		}
	}

	.sort-btn:not(.mc-button) {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 4px 14px;
		font-size: 0.8125rem;
		font-weight: 500;
		border-radius: 16px;
		border: none;
		background: var(--color--team-card-bg);
		color: var(--color--text);
		text-decoration: none;
		cursor: pointer;
		font-family: inherit;
		transition:
			background 0.35s var(--ease-4),
			color 0.35s var(--ease-4),
			transform 0.2s var(--ease-out-3);

		&:hover {
			background: var(--color--team-badge-bg);
			color: var(--color--team-badge-text);
		}

		&:active {
			transform: scale(0.97);
		}

		&.active {
			background: var(--color--team-badge-bg);
			color: var(--color--team-badge-text);
		}

		@include for-phone-only {
			gap: 6px;
			padding: 6px 10px;
			font-size: 0.75rem;
		}
	}

	.sort-btn-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;

		:global(svg) {
			width: 100%;
			height: 100%;
		}
	}

	.news-header {
		text-align: center;
		margin-bottom: 1.5em;

		.label {
			@include fluid-text(0.75rem, 0.875rem);
			letter-spacing: 0.15em;
			color: var(--color--text-shade);
			margin: 0 0 8px;

			@include for-phone-only {
				font-size: 0.6875rem;
				letter-spacing: 0.1em;
				margin-bottom: 4px;
			}
		}

		.page-title {
			font-family: var(--font--title);
			margin: 0 0 16px;
			color: var(--color--text);
			@include fluid-text(1.75rem, 2.25rem);

			@include for-phone-only {
				font-size: 1.5rem;
			}
		}
	}

	.news-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
		align-items: stretch;

		@include for-phone-only {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.5rem;
		}

		.card-item {
			display: flex;
			min-height: 0;
			opacity: 0;

			& > :global(a) {
				flex: 1 1 auto;
				min-width: 0;
			}
		}

		&.mounted .card-item {
			animation: card-fade-in 0.4s ease-out forwards;
			animation-delay: calc(var(--i) * 60ms);
		}
	}

	@media screen and (prefers-reduced-motion: reduce) {
		.news-grid.mounted .card-item {
			animation: none;
			opacity: 1;
		}
	}

	@keyframes card-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.empty {
		@include fluid-text(0.9375rem, 1.0625rem);
		text-align: center;
		color: var(--color--text-shade);
		padding: 2rem;
	}

	.pagination {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.5rem 1rem;
		margin-top: 2.5rem;
		padding: 1rem 0;
	}

	.pagination-pages {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.pagination-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
	}

	.pagination-link {
		@include fluid-text(0.875rem, 1rem);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2.25rem;
		height: 2.25rem;
		padding: 0 0.5rem;
		color: var(--color--text);
		text-decoration: none;
		border-radius: 6px;
		transition: background-color 0.2s, color 0.2s;

		&:hover:not(.current):not(.disabled) {
			background-color: var(--color--primary-shade);
			color: var(--color--page-background);
		}

		&.current {
			background-color: var(--color--primary);
			color: var(--color--page-background);
			font-weight: 600;
			cursor: default;
		}

		&.disabled {
			color: var(--color--text-shade);
			cursor: not-allowed;
			opacity: 0.7;
		}
	}

	.pagination-ellipsis {
		@include fluid-text(0.875rem, 1rem);
		color: var(--color--text-shade);
		padding: 0 0.25rem;
		user-select: none;
	}
</style>
