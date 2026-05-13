<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import dateformat from 'dateformat';
	import { keywords } from '$lib/data/meta';
	import type { NewsPost } from '$lib/utils/types';
	import ImageWithSkeleton from '$ui/ImageWithSkeleton.svelte';
	import NewsCard from '$blocks/NewsCard.svelte';
	import { parseVideoCoverUrl } from '$lib/utils/embedVideoLinks';
	import { ArrowLeft as ArrowLeftIcon } from '$lib/icons';
	import { sound } from '$lib/utils/sound';

	interface Props {
		post: NewsPost;
		/** From DB (Admin → Settings). */
		siteTitle?: string;
		/** From DB. Used for og:image URL. */
		siteBaseUrl?: string;
		children: import('svelte').Snippet;
	}

	let { post, siteTitle = '', siteBaseUrl = '', children }: Props = $props();

	const baseUrl = $derived((siteBaseUrl || '').replace(/\/$/, ''));
	const coverVideo = $derived(parseVideoCoverUrl(post.coverImage));

	let mounted = $state(false);

	function goBack() {
		if (typeof window !== 'undefined' && window.history.length > 1) {
			window.history.back();
		} else {
			goto('/news');
		}
	}

	onMount(() => {
		mounted = true;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				goBack();
			}
		};
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	});

	const metaKeywords = $derived(
		[
			...(post.tags ?? []),
			...(post.keywords ?? []),
			...keywords
		]
	);
</script>

<svelte:head>
	<meta name="keywords" content={metaKeywords.join(', ')} />
	<meta name="description" content={post.excerpt} />
	<meta property="og:description" content={post.excerpt} />
	<meta name="twitter:description" content={post.excerpt} />
	<title>{post.title} — {siteTitle}</title>
	<meta property="og:title" content="{post.title} — {siteTitle}" />
	<meta name="twitter:title" content="{post.title} — {siteTitle}" />
	{#if post.coverImage && !coverVideo}
		<meta property="og:image" content="{post.coverImage.startsWith('http') ? post.coverImage : baseUrl + (post.coverImage.startsWith('/') ? post.coverImage : '/' + post.coverImage)}" />
		<meta name="twitter:image" content="{post.coverImage.startsWith('http') ? post.coverImage : baseUrl + (post.coverImage.startsWith('/') ? post.coverImage : '/' + post.coverImage)}" />
	{/if}
</svelte:head>

<div class="article-layout">
	<div class="article-layout-inner" class:mounted>
		<article id="article-content">
			<header class="article-header">
				<nav class="back-col" aria-label="Back to news">
					<button type="button" class="back-button" onclick={goBack} title="Back to news (Esc)" use:sound>
						<span class="back-icon" aria-hidden="true">
							<ArrowLeftIcon />
						</span>
						Back
					</button>
				</nav>
				<div class="header-content">
					<h1>{post.title}</h1>
					<div class="note">Published on {dateformat(post.date, 'UTC:dd mmmm yyyy')}</div>
					{#if post.updated}
						<div class="note secondary-note">Updated on {dateformat(post.updated, 'UTC:dd mmmm yyyy')}</div>
					{/if}
					{#if post.readingTime}
						<div class="note">{post.readingTime}</div>
					{/if}
					{#if post.tags?.length}
						<div class="tags">
							{#each post.tags as tag}
								<span class="tag">{tag}</span>
							{/each}
						</div>
					{/if}
				</div>
			</header>
			{#if post.coverImage}
				{#if coverVideo}
					<div class="cover-image cover-image--video">
						<div class="cover-video-wrapper">
							{#if coverVideo?.type === 'youtube'}
								<iframe
									title="YouTube video"
									src="https://www.youtube.com/embed/{coverVideo.videoId}"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									allowfullscreen
									loading="eager"
								></iframe>
							{:else if coverVideo.type === 'tiktok'}
								<iframe
									title="TikTok video"
									src="https://www.tiktok.com/player/v1/{coverVideo.videoId}"
									allow="fullscreen"
									loading="eager"
								></iframe>
							{/if}
						</div>
					</div>
				{:else}
					<div class="cover-image">
						<ImageWithSkeleton
							src={post.coverImage}
							alt={post.title}
							aspectRatio="16/9"
							loading="eager"
							decoding="async"
							fetchpriority="high"
							class="cover-img"
						/>
					</div>
				{/if}
			{/if}
			<div class="content">
				{@render children()}
			</div>
		</article>

		{#if post.relatedPosts?.length}
			<aside class="related">
				<h2>Related news</h2>
				<div class="related-grid" class:mounted>
					{#each post.relatedPosts as related, i}
						<div class="card-item" style="--i: {i}">
							<NewsCard
								title={related.title}
								excerpt={related.excerpt}
								slug={related.slug}
								readingTime={related.readingTime}
								tags={related.tags}
								coverImage={related.coverImage}
								showImage={true}
							/>
						</div>
					{/each}
				</div>
			</aside>
		{/if}
	</div>
</div>

<style lang="scss">
	@use '$lib/scss/mixins' as *;
	@use '$lib/scss/fluid' as *;

	.article-layout {
		--body-background-color: var(--color--post-page-background);
	}

	.article-layout-inner {
		opacity: 0;
		border-radius: 0;
		background-color: var(--color--post-page-background);
		transform: scale(0.96) translateY(-20px);

		@include for-phone-only {
			width: 100vw;
			max-width: 100vw;
			margin-left: calc(50% - 50vw);
			margin-right: calc(50% - 50vw);
			box-sizing: border-box;
			border-radius: 0;
		}
	}

	.article-layout-inner.mounted {
		animation: post-open 0.4s cubic-bezier(0.33, 1, 0.68, 1) forwards;
	}

	@media screen and (prefers-reduced-motion: reduce) {
		.article-layout-inner.mounted {
			animation: none;
			opacity: 1;
			transform: none;
		}
		.related-grid.mounted .card-item {
			animation: none;
			opacity: 1;
		}
	}

	@keyframes post-open {
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	#article-content {
		--main-column-width: 65ch;
		position: relative;
		padding: 20px 15px 80px;

		@include for-phone-only {
			padding-left: 12px;
			padding-right: 12px;
		}

		@include for-iphone-se {
			padding-left: 10px;
			padding-right: 10px;
		}

		@include for-tablet-portrait-up {
			padding-right: 20px;
			padding-left: 20px;
		}

		@include for-tablet-landscape-up {
			padding-right: 30px;
			padding-left: 30px;
		}

		display: flex;
		flex-direction: column;
		gap: 30px;

		.article-header {
			display: grid;
			grid-template-columns: auto 1fr;
			align-items: start;
			gap: 1rem 1.5rem;
			width: 100%;

			@include for-phone-only {
				grid-template-columns: 1fr;
				grid-template-rows: auto auto;
				gap: 0.75rem 0;
				align-items: stretch;
			}

			@include for-iphone-se {
				gap: 0.5rem 0;
			}
		}

		.back-col {
			padding-top: 2px;

			@include for-phone-only {
				padding-top: 0;
				display: flex;
				justify-content: flex-start;
			}
		}

		.back-button {
			display: inline-flex;
			align-items: center;
			gap: 0.35rem;
			padding: 0.4rem 0.75rem;
			font-size: 0.9375rem;
			font-family: inherit;
			color: var(--color--primary);
			background: transparent;
			border: 1px solid var(--color--primary);
			border-radius: 0;
			cursor: pointer;
			transition: background 0.15s ease, color 0.15s ease;

			@include for-phone-only {
				padding: 0.35rem 0.6rem;
				font-size: 0.875rem;
			}

			@include for-iphone-se {
				padding: 0.3rem 0.5rem;
				font-size: 0.8125rem;
			}

			&:hover {
				background: rgba(var(--color--primary-rgb), 0.1);
			}

			&:focus-visible {
				outline: 2px solid var(--color--primary);
				outline-offset: 2px;
			}

			.back-icon {
				display: inline-flex;
				width: 1em;
				height: 1em;
			}
		}

		.header-content {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			text-align: center;
			gap: 10px;
			width: min(var(--main-column-width), 100%);
			min-width: 0;
			justify-self: center;
			margin: 0 auto;
			margin-left: -5%;

			@include for-phone-only {
				margin-left: 0;
				margin-right: 0;
				gap: 6px;
			}

			@include for-iphone-se {
				gap: 4px;
			}

			h1 {
				@include fluid-text(1.2rem, 3.06rem);

				@include for-phone-only {
					font-size: clamp(0.92rem, 4.86vw + 0.64rem, 2.04rem);
					line-height: 1.25;
				}
			}

			.note {
				@include fluid-text(0.65rem, 1.224rem);
				color: rgba(var(--color--text-rgb), 0.8);

				@include for-phone-only {
					font-size: 0.65rem;
				}
			}
			.secondary-note {
				opacity: 0.4;
				margin-top: -0.75em;
				@include fluid-text(0.52rem, 1.156rem);

				@include for-phone-only {
					font-size: 0.6rem;
				}
			}

			.tags {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 5px;
				flex-wrap: wrap;

				@include for-phone-only {
					gap: 4px;
				}
			}

			.tag {
				padding: 4px 10px;
				border-radius: 0;
				@include fluid-text(0.55rem, 1.105rem);
				background: var(--color--team-badge-bg);
				color: var(--color--team-badge-text);

				@include for-phone-only {
					padding: 3px 8px;
					font-size: 0.55rem;
				}
			}
		}

		.cover-image {
			width: min(var(--main-column-width), 100%);
			margin: 0 auto;
			max-height: 400px;
			border-radius: 0;

			:global(.image-with-skeleton.cover-img) {
				max-height: 400px;
				border-radius: 0;
			}

			:global(.image-with-skeleton img) {
				max-height: 400px;
				object-fit: cover;
			}
		}

		.cover-image--video {
			position: relative;
			width: min(var(--main-column-width), 100%);
			margin: 0 auto;
			max-height: 400px;
			aspect-ratio: 16 / 9;
			border-radius: 0;
			overflow: hidden;
		}

		.cover-video-wrapper {
			position: absolute;
			inset: 0;

			iframe {
				position: absolute;
				inset: 0;
				width: 100%;
				height: 100%;
				border: none;
				border-radius: 0;
			}
		}

		.content {
			display: grid;
			grid-template-columns:
				1fr
				min(var(--main-column-width), 100%)
				1fr;

			:global(> *) {
				grid-column: 2;
			}

			:global(> .full-bleed) {
				grid-column: 1 / 4;
				width: 100%;
				max-width: 1600px;
				margin-left: auto;
				margin-right: auto;
			}
		}
	}

	.related {
		margin-top: 2rem;
		padding: 0 15px 30px;

		@include for-phone-only {
			padding-left: 12px;
			padding-right: 12px;
		}

		@include for-tablet-portrait-up {
			padding-left: 20px;
			padding-right: 20px;
		}

		@include for-tablet-landscape-up {
			padding-left: 30px;
			padding-right: 30px;
		}

		h2 {
			font-family: 'MinecraftTen', sans-serif;
			@include fluid-text(0.9rem, 1.7rem);
			margin-bottom: 1rem;
		}
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1rem;
		align-items: stretch;

		@include for-phone-only {
			grid-template-columns: repeat(2, 1fr);
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

	@keyframes card-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
