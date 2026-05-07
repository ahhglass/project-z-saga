<script lang="ts">
	/**
	 * Image with skeleton placeholder and spinner while loading.
	 * Uses loading="lazy" and decoding="async" by default for better LCP and bandwidth.
	 */
	interface Props {
		src: string;
		alt: string;
		class?: string;
		/** CSS aspect-ratio, e.g. "16/10" or "1" */
		aspectRatio?: string;
		loading?: 'lazy' | 'eager';
		decoding?: 'async' | 'sync' | 'auto';
		fetchpriority?: 'high' | 'low' | 'auto';
	}

	let {
		src,
		alt,
		class: className = '',
		aspectRatio = '16/10',
		loading = 'lazy',
		decoding = 'async',
		fetchpriority = 'auto'
	}: Props = $props();

	let loaded = $state(false);

	function onLoad() {
		loaded = true;
	}

	function onError() {
		loaded = true;
	}
</script>

<div
	class="image-with-skeleton {className}"
	style="--aspect-ratio: {aspectRatio}"
	aria-busy={!loaded}
>
	{#if !loaded}
		<div class="skeleton">
			<div class="spinner" aria-hidden="true"></div>
		</div>
	{/if}
	<img
		src={src}
		alt={alt}
		loading={loading}
		decoding={decoding}
		fetchpriority={fetchpriority}
		onload={onLoad}
		onerror={onError}
		class="img"
		class:loaded
	/>
</div>

<style lang="scss">
	.image-with-skeleton {
		position: relative;
		width: 100%;
		aspect-ratio: var(--aspect-ratio, 16/10);
		overflow: hidden;
		background: var(--color--team-card-avatar-bg, #e8e8e8);
	}

	.skeleton {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background-size: 200% 100%;
		z-index: 1;
		transition: opacity 0.25s ease;
	}

	.img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.img.loaded {
		opacity: 1;
		z-index: 2;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid rgba(0, 0, 0, 0.08);
		border-top-color: var(--color--primary, #e61860);
		border-radius: 50%;
		animation: spinner-rotate 0.7s linear infinite;
	}

	@media screen and (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
			border-top-color: var(--color--primary, #e61860);
			opacity: 0.6;
		}
	}

	@keyframes spinner-rotate {
		to {
			transform: rotate(360deg);
		}
	}
</style>
