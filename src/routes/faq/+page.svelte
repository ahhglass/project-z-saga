<script lang="ts">
	import FaqAccordion from '$blocks/FaqAccordion.svelte';
	import { Search as SearchIcon, Xmark as XmarkIcon, ExpandLines as ExpandLinesIcon, CompressLines as CompressLinesIcon, Discord as DiscordIcon } from '$lib/icons';
	import type { FaqItem } from '$lib/data/faq';
	import type { SiteSettings } from '../+layout.server';
	import Button from '$ui/Button.svelte';
	import Sparkles from '$ui/Sparkles.svelte';
	import { title as defaultTitle } from '$lib/data/meta';

	interface Props {
		data: { settings?: SiteSettings | null; items?: FaqItem[]; tags?: string[] };
	}

	let { data }: Props = $props();

	const siteTitle = $derived(data?.settings?.site_title ?? defaultTitle);

	const items = $derived(data?.items ?? []);
	const tags = $derived(data?.tags ?? []);

	let search = $state('');
	let activeTag = $state('');
	let openIds = $state<Set<string>>(new Set());

	const filteredItems = $derived(
		items.filter((item) => {
			const matchSearch =
				!search ||
				item.question.toLowerCase().includes(search.toLowerCase()) ||
				item.answer.toLowerCase().includes(search.toLowerCase());
			const matchTag = !activeTag || item.tag === activeTag;
			return matchSearch && matchTag;
		})
	);

	const resultsCount = $derived(filteredItems.length);

	function toggle(id: string) {
		openIds = new Set(openIds);
		if (openIds.has(id)) openIds.delete(id);
		else openIds.add(id);
	}

	function expandAll() {
		openIds = new Set(filteredItems.map((i) => i.id));
	}

	function collapseAll() {
		openIds = new Set();
	}

	function setTag(tag: string) {
		activeTag = activeTag === tag ? '' : tag;
	}
</script>

<svelte:head>
	<title>FAQ — {siteTitle}</title>
	<meta name="description" content="Frequently asked questions." />
</svelte:head>

<div class="container faq-page">
	<p class="label">KNOWLEDGE BASE</p>
	<h1 class="title">Frequently Asked Questions</h1>

	<section class="find-section">
		<h2 class="find-title">Find your answer fast</h2>
		<p class="find-desc">Explore information and stay up to date with the project's development.</p>

		<div class="search-wrap group">
			<div class="search-main" class:has-clear={search.length > 0}>
				<span class="search-icon" aria-hidden="true">
					<SearchIcon />
				</span>
				<input
					id="faq-search"
					type="search"
					class="search-input mc-form-input"
					bind:value={search}
					placeholder="Search questions or keywords"
					aria-label="Search FAQ"
					autocomplete="off"
				/>
				{#if search.length > 0}
					<button
						type="button"
						class="search-clear"
						aria-label="Clear search"
						onclick={() => (search = '')}
					>
						<span class="search-clear-icon" aria-hidden="true"><XmarkIcon /></span>
					</button>
				{/if}
			</div>
			<div class="search-curseforge-wrap">
				<Sparkles>
					<Button color="secondary" href="https://discord.gg/Z63vRU8zkY">
						{#snippet icon()}
							<DiscordIcon />
						{/snippet}
						<span class="curseforge-btn-text">Join Discord</span>
					</Button>
				</Sparkles>
			</div>
		</div>

		<div class="controls">
			<div class="filters-wrap">
				<div class="filters">
					{#each tags as tag}
						<button
							type="button"
							class="filter-btn mc-button mc-button-normal"
							class:active={activeTag === tag}
							onclick={() => setTag(tag)}
						>
							{tag}
						</button>
					{/each}
				</div>
			</div>
			<div class="actions">
				<button type="button" class="action-btn mc-button mc-button-normal" onclick={expandAll}>
					<span class="action-btn-icon" aria-hidden="true"><ExpandLinesIcon /></span>
					Expand all
				</button>
				<button type="button" class="action-btn mc-button mc-button-normal" onclick={collapseAll}>
					<span class="action-btn-icon" aria-hidden="true"><CompressLinesIcon /></span>
					Collapse all
				</button>
			</div>
		</div>

		<p class="results-count">{resultsCount} RESULTS</p>
	</section>

	<div class="accordion-list">
		{#each filteredItems as item (item.id)}
			<FaqAccordion item={item} open={openIds.has(item.id)} onToggle={() => toggle(item.id)} />
		{/each}
	</div>

	{#if filteredItems.length === 0}
		<p class="no-results">No questions match your search or filter.</p>
	{/if}
</div>

<style lang="scss">
	@use '$lib/scss/breakpoints' as *;
	@use '$lib/scss/fluid' as *;

	.faq-page {
		@include for-phone-only {
			padding: 0 0.25rem;
		}
	}

	.label {
		text-align: center;
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

	.title {
		text-align: center;
		font-family: var(--font--title);
		font-weight: 700;
		color: var(--color--text);
		margin: 0 0 40px;
		@include fluid-text(1.75rem, 2.25rem);

		@include for-phone-only {
			font-size: 1.5rem;
			margin-bottom: 24px;
		}

		@include for-iphone-se {
			font-size: 1.25rem;
			margin-bottom: 20px;
		}
	}

	.find-section {
		margin-bottom: 32px;

		@include for-phone-only {
			margin-bottom: 24px;
		}
	}

	.find-title {
		@include fluid-text(1rem, 1.125rem);
		font-weight: 600;
		color: var(--color--text);
		margin: 0 0 6px;

		@include for-phone-only {
			font-size: 0.9375rem;
		}
	}

	.find-desc {
		@include fluid-text(0.875rem, 1rem);
		color: var(--color--text-shade);
		margin: 0 0 20px;

		@include for-phone-only {
			font-size: 0.8125rem;
			margin-bottom: 14px;
		}
	}

	.search-wrap {	
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;

		@include for-phone-only {
			flex-direction: column;
			align-items: stretch;
			justify-content: flex-start;
			gap: 8px;
			margin-bottom: 12px;
		}
	}

	.search-main {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
		max-width: 380px;

		&.has-clear .search-input {
			padding-right: 2.75rem;
		}

		@include for-phone-only {
			width: 100%;
			max-width: none;

			&.has-clear .search-input {
				padding-right: 2.5rem;
			}
		}
	}

	.search-curseforge-wrap {
		display: flex;
		align-items: center;

		@include for-phone-only {
			width: 100%;
			justify-content: stretch;

			:global(.sparkle-wrapper) {
				width: 100%;
			}
			:global(.button) {
				width: 100%;
				justify-content: center;
				display: flex;
			}
		}

		:global(.button) {
			white-space: nowrap;
		}
	}

	.search-icon {
		position: absolute;
		left: 14px;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		color: var(--color--text-shade);
		pointer-events: none;
		transition: color 0.2s ease;
		z-index: 1;

		@include for-phone-only {
			left: 12px;
			width: 1.125rem;
			height: 1.125rem;
		}

		.group:focus-within & {
			color: var(--color--primary);
		}

		:global(svg) {
			width: 100%;
			height: 100%;
		}
	}

	.search-input {
		width: 100%;
		padding: 8px 12px 8px 42px;
		box-sizing: border-box;
		-webkit-appearance: none;
		appearance: none;

		&:focus {
			outline: none;
		}

		&.mc-form-input {
			min-height: 40px;
			border-radius: 0;
		}

		&::-webkit-search-cancel-button,
		&::-webkit-search-decoration {
			-webkit-appearance: none;
			appearance: none;
		}

		@include for-phone-only {
			padding: 7px 12px 6px 40px;
			min-height: 2.5rem;
		}
	}

	.search-clear {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		border: none;
		background: transparent;
		color: var(--color--text-shade);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: color 0.2s ease, background 0.2s ease;
		z-index: 1;

		&:hover {
			color: var(--color--text);
			background: rgba(var(--color--primary-rgb), 0.1);
		}

		.search-clear-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 1.2rem;
			height: 1.2rem;

			:global(svg) {
				width: 100%;
				height: 100%;
			}
		}

		@include for-phone-only {
			right: 8px;
			width: 1.25rem;
			height: 1.25rem;

			.search-clear-icon {
				width: 1rem;
				height: 1rem;
			}
		}
	}

	.curseforge-btn-text {
		white-space: nowrap;
	}

	.search-curseforge-wrap :global(.button) {
		white-space: nowrap !important;
	}

	:global(.sparkles) {
		width: auto;
	}

	.controls {
		display: flex;
		gap: 12px;
		margin-bottom: 12px;
		justify-content: center;
		align-items: flex-start;

		@include for-phone-only {
			flex-direction: column;
			align-items: stretch;
			gap: 10px;
			margin-bottom: 10px;
		}
	}

	.filters-wrap {
		@include for-phone-only {
			position: relative;
			overflow: hidden;
			margin: 0 -0.25rem;

			&::before,
			&::after {
				content: '';
				position: absolute;
				top: 0;
				bottom: 0;
				width: 1.5rem;
				pointer-events: none;
				z-index: 1;
			}

			&::before {
				left: 0;
				background: linear-gradient(to right, var(--color--main-content), transparent);
			}

			&::after {
				right: 0;
				background: linear-gradient(to left, var(--color--main-content), transparent);
			}
		}
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;

		@include for-phone-only {
			flex-wrap: nowrap;
			gap: 6px;
			overflow-x: auto;
			overflow-y: hidden;
			-webkit-overflow-scrolling: touch;
			scrollbar-width: none;
			-ms-overflow-style: none;
			padding: 2px 0.25rem;

			&::-webkit-scrollbar {
				display: none;
			}
		}
	}

	.filter-btn:not(.mc-button) {
		padding: 4px 8px;
		font-size: 0.75rem;
		font-weight: 500;
		border-radius: 14px;
		border: none;
		background: var(--color--team-card-bg);
		color: var(--color--text);
		cursor: pointer;
		font-family: inherit;
		transition:
			background 0.35s var(--ease-4),
			border-color 0.35s var(--ease-4),
			color 0.35s var(--ease-4),
			transform 0.2s var(--ease-out-3);

		&:hover {
			background: var(--color--team-badge-bg);
			border-color: var(--color--team-badge-text);
		}

		&:active {
			transform: scale(0.97);
		}

		&.active {
			background: var(--color--team-badge-bg);
			color: var(--color--team-badge-text);
			border-color: var(--color--team-badge-text);
		}

		@include for-phone-only {
			padding: 6px 10px;
			font-size: 0.8125rem;
		}
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-left: auto;

		@include for-phone-only {
			margin-left: 0;
			gap: 6px;
			justify-content: center;
		}
	}

	.action-btn:not(.mc-button) {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		font-size: 0.75rem;
		font-weight: 500;
		border-radius: 14px;
		border: none;
		background: var(--color--team-card-bg);
		color: var(--color--text);
		cursor: pointer;
		font-family: inherit;
		transition:
			background 0.35s var(--ease-4),
			border-color 0.35s var(--ease-4),
			color 0.35s var(--ease-4),
			transform 0.2s var(--ease-out-3);

		&:hover {
			background: var(--color--team-badge-bg);
			color: var(--color--team-badge-text);
		}

		&:active {
			transform: scale(0.97);
		}

		@include for-phone-only {
			padding: 6px 10px;
			font-size: 0.8125rem;
		}
	}

	.action-btn-icon {
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

	.results-count {
		font-size: 0.85rem;
		color: var(--color--text-shade);
		margin: 0;

		@include for-phone-only {
			font-size: 0.75rem;
			text-align: center;
		}
	}

	.accordion-list {
		margin-top: 8px;

		@include for-phone-only {
			margin-top: 4px;
		}
	}

	.no-results {
		text-align: center;
		color: var(--color--text-shade);
		padding: 40px 20px;

		@include for-phone-only {
			padding: 24px 12px;
			font-size: 0.875rem;
		}
	}
</style>
