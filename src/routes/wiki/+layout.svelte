<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import type { WikiArticle, WikiCategory } from '$lib/data/wiki';
	import { sound } from '$lib/utils/sound';

	interface Props {
		data: {
			categories: WikiCategory[];
			articles: WikiArticle[];
			currentCategoryId: string | null;
			currentArticleSlug: string | null;
		};
		children: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

	const categories = $derived(data?.categories ?? []);
	const articles = $derived(data?.articles ?? []);
	const currentCategoryId = $derived(data?.currentCategoryId ?? null);
	const currentArticleSlug = $derived(data?.currentArticleSlug ?? null);

	let mobileNavOpen = $state(false);

	const articlesByCategory = $derived.by(() => {
		const map = new Map<string, WikiArticle[]>();
		for (const c of categories) {
			const list = articles
				.filter((a) => a.categoryId === c.id)
				.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
			map.set(c.id, list);
		}
		return map;
	});

	function isCategoryActive(id: string): boolean {
		return currentCategoryId === id;
	}

	function isArticleActive(categoryId: string, slug: string): boolean {
		return currentCategoryId === categoryId && currentArticleSlug === slug;
	}

	function handleToggleMobileNav(): void {
		mobileNavOpen = !mobileNavOpen;
	}

	function handleCloseMobileNav(): void {
		mobileNavOpen = false;
	}

	function handleNavLinkClick(): void {
		mobileNavOpen = false;
	}

	afterNavigate(() => {
		if (!browser) return;
		mobileNavOpen = false;
	});
</script>

<div class="wiki-layout" data-sveltekit-preload-data="off">
	<div class="wiki-toolbar">
		<button
			type="button"
			class="wiki-toolbar__toggle mc-button mc-button-normal"
			aria-expanded={mobileNavOpen}
			aria-controls="wiki-sidebar-panel"
			onclick={handleToggleMobileNav}
		>
			{mobileNavOpen ? 'Close wiki menu' : 'Wiki categories'}
		</button>
		<a href="/wiki" class="wiki-toolbar__home" onclick={handleNavLinkClick} use:sound>Wiki home</a>
	</div>

	<div class="wiki-grid">
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div
			class="wiki-sidebar-backdrop"
			class:open={mobileNavOpen}
			onclick={handleCloseMobileNav}
			role="presentation"
			aria-hidden={!mobileNavOpen}
		></div>

		<aside
			id="wiki-sidebar-panel"
			class="wiki-sidebar"
			class:open={mobileNavOpen}
			aria-label="Wiki navigation"
		>
			<div class="wiki-sidebar__inner">
				<p class="wiki-sidebar__label">Project Z Saga</p>
				<a
					href="/wiki"
					class="wiki-sidebar__title-link"
					onclick={handleNavLinkClick}
					use:sound
				>
					Wiki
				</a>
				<p class="wiki-sidebar__hint">Pick a topic on the left, then choose a page.</p>

				<nav class="wiki-nav" aria-label="Wiki categories">
					{#each categories as cat}
						<div class="wiki-nav__block">
							<a
								href="/wiki/{cat.id}"
								class="wiki-nav__category"
								class:active={isCategoryActive(cat.id) && !currentArticleSlug}
								onclick={handleNavLinkClick}
								use:sound
							>
								{cat.title}
							</a>
							<ul class="wiki-nav__articles">
								{#each articlesByCategory.get(cat.id) ?? [] as art}
									<li>
										<a
											href="/wiki/{cat.id}/{art.slug}"
											class="wiki-nav__article"
											class:active={isArticleActive(cat.id, art.slug)}
											aria-current={isArticleActive(cat.id, art.slug) ? 'page' : undefined}
											onclick={handleNavLinkClick}
											use:sound
										>
											{art.title}
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</nav>
			</div>
		</aside>

		<main class="wiki-main">
			{@render children()}
		</main>
	</div>
</div>

<style lang="scss">
	@use '$lib/scss/breakpoints' as *;

	.wiki-layout {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 15px 48px;
		box-sizing: border-box;

		@include for-phone-only {
			padding: 0 0.75rem 32px;
		}
	}

	.wiki-toolbar {
		display: none;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 16px;
		flex-wrap: wrap;

		@include for-phone-only {
			display: flex;
		}
	}

	.wiki-toolbar__toggle {
		flex: 1;
		min-width: min(200px, 100%);
		justify-content: center;
	}

	.wiki-toolbar__home {
		color: var(--color--primary);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.875rem;

		&:hover {
			text-decoration: underline;
		}
	}

	.wiki-grid {
		display: grid;
		grid-template-columns: 260px minmax(0, 1fr);
		gap: 32px;
		align-items: start;

		@include for-phone-only {
			grid-template-columns: 1fr;
			gap: 0;
			position: relative;
		}
	}

	.wiki-sidebar-backdrop {
			display: none;

			@include for-phone-only {
				display: block;
				position: fixed;
				inset: 0;
				z-index: 88;
				background: rgba(0, 0, 0, 0.35);
				backdrop-filter: blur(2px);
				opacity: 0;
				visibility: hidden;
				transition: opacity 0.2s ease, visibility 0.2s ease;
				pointer-events: none;

				&.open {
					opacity: 1;
					visibility: visible;
					pointer-events: auto;
				}
			}
		}

	.wiki-sidebar {
		position: sticky;
		top: 96px;
		border: 1px solid var(--color--code-inline-background);
		background: var(--color--team-card-bg, rgba(0, 0, 0, 0.04));
		border-radius: 12px;
		max-height: calc(100vh - 120px);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		min-height: 0;

		@include for-phone-only {
			position: fixed;
			top: 0;
			left: 0;
			bottom: 0;
			width: min(300px, 88vw);
			z-index: 89;
			max-height: none;
			height: 100%;
			border-radius: 0;
			transform: translateX(-100%);
			transition: transform 0.25s ease;
			pointer-events: none;

			&.open {
				transform: translateX(0);
				pointer-events: auto;
			}
		}
	}

	.wiki-sidebar__inner {
		flex: 1;
		min-height: 0;
		max-height: calc(100vh - 120px);
		overflow-x: hidden;
		overflow-y: auto;
		padding: 16px 8px 16px 14px;

		scrollbar-width: thin;
		scrollbar-color: rgba(var(--color--primary-rgb, 54, 172, 48), 0.65) transparent;

		&::-webkit-scrollbar {
			width: 8px;
		}

		&::-webkit-scrollbar-track {
			background: transparent;
			margin-block: 8px;
			border-radius: 100px;
		}

		&::-webkit-scrollbar-thumb {
			border-radius: 100px;
			background-color: rgba(var(--color--primary-rgb, 54, 172, 48), 0.55);
			border: 2px solid transparent;
			background-clip: padding-box;
			min-height: 36px;
		}

		&::-webkit-scrollbar-thumb:hover,
		&::-webkit-scrollbar-thumb:active {
			background-color: var(--color--primary-shade);
			background-clip: padding-box;
			border: 2px solid transparent;
		}

		&::-webkit-scrollbar-corner {
			background: transparent;
		}

		@include for-phone-only {
			max-height: none;
			height: auto;
			flex: 1;
			min-height: 0;
			padding-top: calc(16px + env(safe-area-inset-top));
			padding-bottom: calc(16px + env(safe-area-inset-bottom));
			padding-inline: 14px 10px;
		}
	}

	.wiki-sidebar__label {
		font-size: 0.65rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color--text-shade);
		margin: 0 0 4px;
	}

	.wiki-sidebar__title-link {
		font-family: var(--font--title);
		font-weight: 700;
		font-size: 1.35rem;
		color: var(--color--text);
		text-decoration: none;
		display: inline-block;
		margin-bottom: 8px;

		&:hover {
			color: var(--color--primary);
		}
	}

	.wiki-sidebar__hint {
		font-size: 0.8125rem;
		color: var(--color--text-shade);
		margin: 0 0 16px;
		line-height: 1.4;
	}

	.wiki-nav__block {
		margin-bottom: 14px;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.wiki-nav__category {
		display: block;
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--color--text);
		text-decoration: none;
		padding: 4px 0;
		border-bottom: 1px solid var(--color--code-inline-background);

		&:hover {
			color: var(--color--primary);
		}

		&.active {
			color: var(--color--primary);
		}
	}

	.wiki-nav__articles {
		list-style: none;
		margin: 6px 0 0;
		padding: 0 0 0 10px;
		border-left: 2px solid var(--color--code-inline-background);
	}

	.wiki-nav__article {
		display: block;
		font-size: 0.8125rem;
		color: var(--color--text-shade);
		text-decoration: none;
		padding: 4px 0;
		line-height: 1.35;

		&:hover {
			color: var(--color--primary);
		}

		&.active {
			color: var(--color--primary);
			font-weight: 600;
		}
	}

	.wiki-main {
		min-width: 0;
		padding-top: 4px;
	}
</style>
