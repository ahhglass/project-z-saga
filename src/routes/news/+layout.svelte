<script lang="ts">
	import type { NewsPost } from '$lib/utils/types';
	import type { SiteSettings } from '../+layout.server';
	import NewsArticleLayout from '$layout/NewsArticleLayout.svelte';

	interface Props {
		data: { settings?: SiteSettings | null; post?: NewsPost; posts?: NewsPost[] };
		children: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

	const siteTitle = $derived(data?.settings?.site_title ?? '');
	const siteBaseUrl = $derived(data?.settings?.site_base_url ?? '');
</script>

{#if data.post}
	<NewsArticleLayout post={data.post} siteTitle={siteTitle} siteBaseUrl={siteBaseUrl}>
		{@render children()}
	</NewsArticleLayout>
{:else}
	{@render children()}
{/if}
