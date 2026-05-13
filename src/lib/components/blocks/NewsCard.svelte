<script lang="ts">
	import ImageWithSkeleton from '$ui/ImageWithSkeleton.svelte';
	import { parseVideoCoverUrl, youtubeThumbUrl } from '$lib/utils/embedVideoLinks';
	import { sound } from '$lib/utils/sound';

	interface Props {
		title: string;
		excerpt: string;
		slug: string;
		readingTime?: string;
		tags?: string[];
		coverImage?: string;
		showImage?: boolean;
	}

	let {
		title,
		excerpt,
		slug,
		readingTime = '',
		tags = [],
		coverImage,
		showImage = true
	}: Props = $props();

	const href = $derived(`/news/${slug}`);
	const coverVideo = $derived(parseVideoCoverUrl(coverImage));
</script>

<a href={href} class="news-card" data-sveltekit-preload-data use:sound>
	{#if showImage && coverImage}
		<div class="image">
			{#if coverVideo}
				<div class="cover-media cover-media--video" style="--aspect-ratio: 16/10">
					{#if coverVideo.type === 'youtube'}
						<img
							class="cover-media__thumb"
							src={youtubeThumbUrl(coverVideo.videoId)}
							alt=""
							loading="lazy"
							decoding="async"
						/>
					{:else}
						<div class="cover-media__wrapper">
							<iframe
								title="TikTok video"
								src="https://www.tiktok.com/player/v1/{coverVideo.videoId}"
								allow="fullscreen"
								loading="lazy"
							></iframe>
						</div>
					{/if}
				</div>
			{:else}
				<ImageWithSkeleton
					src={coverImage}
					alt={title}
					aspectRatio="16/10"
					loading="lazy"
					decoding="async"
				/>
			{/if}
		</div>
	{/if}
	<div class="body">
		<h3 class="title">{title}</h3>
		<span class="spacer" aria-hidden="true"></span>
		{#if readingTime}
			<span class="meta">{readingTime}</span>
		{/if}
		{#if excerpt}
			<p class="excerpt">{excerpt}</p>
		{/if}
		{#if tags?.length}
			<div class="tags">
				{#each tags.slice(0, 3) as tag}
					<span class="tag">{tag}</span>
				{/each}
			</div>
		{/if}
	</div>
</a>

<style lang="scss">
	@use '$lib/scss/breakpoints' as *;
	@use '$lib/scss/fluid' as *;

	.news-card {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		background: var(--color--card-background);
		border-radius: 0;
		overflow: hidden;
		box-shadow: none;
		text-decoration: none;
		color: inherit;
		transition: background-color 0.15s ease;

		&:hover {
			background: var(--color--team-card-bg, var(--color--card-background));
		}
	}

	.image {
		overflow: hidden;
		:global(.image-with-skeleton) {
			width: 100%;
		}
	}

	.cover-media--video {
		position: relative;
		width: 100%;
		aspect-ratio: var(--aspect-ratio, 16/10);
		overflow: hidden;
		background: var(--color--team-card-avatar-bg, #e8e8e8);
	}
	.cover-media__thumb {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.cover-media__wrapper {
		position: absolute;
		inset: 0;
	}
	/* TikTok iframe: cover 16/10, crop sides */
	.cover-media__wrapper iframe {
		position: absolute;
		top: 0;
		left: 50%;
		width: 111.11%; /* 10/9 of container so height fills at 16/9 */
		height: 100%;
		min-width: 100%;
		transform: translateX(-50%);
		border: none;
		pointer-events: auto;
	}

	.body {
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-height: 0;
		gap: 0.5rem;

		@include for-phone-only {
			padding: 0.5rem 0.5rem 0.6rem;
			gap: 0.25rem;
		}
	}

	.spacer {
		flex: 1 1 0;
		min-height: 0.35rem;
		display: block;
	}

	.title {
		font-family: 'MinecraftTen', sans-serif;
		@include fluid-text(0.8rem, 1.496rem);
		font-weight: bold;
		line-height: 1.3;
		margin: 0;
		word-break: break-word;
		overflow-wrap: break-word;

		@include for-phone-only {
			font-size: 0.8125rem;
			line-height: 1.25;
		}
	}

	.meta {
		@include fluid-text(0.6rem, 1.088rem);
		color: var(--color--text-shade);

		@include for-phone-only {
			font-size: 0.6875rem;
		}
	}

	.excerpt {
		@include fluid-text(0.68rem, 1.224rem);
		margin: 0;
		line-height: 1.4;
		color: var(--color--text-shade);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-break: break-word;
		overflow-wrap: break-word;

		@include for-phone-only {
			font-size: 0.75rem;
			line-height: 1.3;
			-webkit-line-clamp: 2;
			line-clamp: 2;
		}
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-top: 0.25rem;

		@include for-phone-only {
			gap: 0.2rem;
			margin-top: 0.15rem;
		}
	}

	.tag {
		font-family: 'MinecraftSeven', sans-serif;
		padding: 0.2rem 0.5rem;
		border-radius: 0;
		border: 1px solid var(--mc-hr-bottom, rgba(0, 0, 0, 0.2));
		@include fluid-text(0.56rem, 1.02rem);
		background: var(--color--team-badge-bg);
		color: var(--color--team-badge-text);

		@include for-phone-only {
			padding: 0.15rem 0.35rem;
			font-size: 0.625rem;
		}
	}
</style>
