<script lang="ts">
	import type { NewsPost } from '$lib/utils/types';

	interface Props {
		data: { post?: NewsPost };
	}

	let { data }: Props = $props();

	// This route is used for DB-driven posts (no static +page.md folder).
	// Layout load already provided data.post with .html from Supabase.
	const post = $derived(data?.post);
	const html = $derived(post?.html ?? '');
</script>

{#if html}
	<div class="article-body md-content" data-slug={post?.slug}>
		{@html html}
	</div>
{:else}
	<!-- Static .md routes render their own content as children; this branch is for [slug] when post has no html (fallback) -->
	<div class="article-body">No content.</div>
{/if}

<style>
	.article-body {
		word-wrap: break-word;
	}
	/* Match typical markdown output from marked */
	.article-body :global(h1),
	.article-body :global(h2),
	.article-body :global(h3) {
		margin-top: 1.5em;
		margin-bottom: 0.5em;
		font-weight: 600;
	}
	.article-body :global(h1) {
		font-size: 1.5em;
	}
	.article-body :global(h2) {
		font-size: 1.25em;
	}
	.article-body :global(h3) {
		font-size: 1.1em;
	}
	.article-body :global(p) {
		margin-bottom: 1em;
	}
	.article-body :global(ul),
	.article-body :global(ol) {
		margin-bottom: 1em;
		padding-left: 1.5em;
	}
	.article-body :global(a) {
		color: var(--color--primary);
	}
	.article-body :global(code) {
		background: var(--color--code-inline-background);
		padding: 0.15em 0.4em;
		border-radius: 4px;
		font-size: 0.9em;
	}
	.article-body :global(pre) {
		overflow-x: auto;
		padding: 1rem;
		background: var(--color--code-inline-background);
		border-radius: 8px;
		margin-bottom: 1em;
	}
	.article-body :global(pre code) {
		background: none;
		padding: 0;
	}

	/* Responsive video embeds (YouTube, TikTok) */
	.article-body :global(.video-embed) {
		margin: 1.5em 0;
		max-width: 100%;
	}
	.article-body :global(.video-embed__wrapper) {
		position: relative;
		width: 100%;
		padding-bottom: 56.25%; /* 16:9 */
		height: 0;
		overflow: hidden;
		border-radius: 8px;
		background: var(--color--code-inline-background, #1a1a1a);
	}
	.article-body :global(.video-embed__wrapper iframe) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: none;
	}
	/* TikTok is often vertical; allow taller aspect on small screens */
	.article-body :global(.video-embed--tiktok .video-embed__wrapper) {
		padding-bottom: 177.78%; /* 9:16 */
		max-width: 360px;
		margin-left: auto;
		margin-right: auto;
	}
</style>
