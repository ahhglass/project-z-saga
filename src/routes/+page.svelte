<script lang="ts">
	import Hero from '$layout/Hero.svelte';
	import About from '$layout/About.svelte';
	import type { SiteSettings } from './+layout.server';
	import { parseSocialLinks } from '$lib/utils/types';
	import { title as defaultTitle, description as defaultDescription } from '$lib/data/meta';

	interface Props {
		data: { settings?: SiteSettings | null };
	}

	let { data }: Props = $props();

	const title = $derived(data?.settings?.site_title ?? defaultTitle);
	const heroTitle = $derived(data?.settings?.hero_title ?? '');
	const heroSubtitle = $derived(data?.settings?.hero_subtitle ?? '');
	const siteDescription = $derived(data?.settings?.site_description ?? defaultDescription);
	const aboutHeading = $derived(data?.settings?.about_heading ?? '');
	const aboutHighlight = $derived(data?.settings?.about_highlight ?? '');
	const aboutText = $derived(data?.settings?.about_text ?? '');
	const aboutImage = $derived(data?.settings?.about_image ?? '');
	const socialLinks = $derived(parseSocialLinks(data?.settings?.social_links));
</script>

<svelte:head>
	<title>Home — {title}</title>
</svelte:head>

<div class="container">
	<Hero heroTitle={heroTitle || undefined} heroSubtitle={heroSubtitle || undefined} />
	<About
		aboutHeading={aboutHeading}
		aboutHighlight={aboutHighlight}
		aboutText={aboutText}
		aboutImage={aboutImage}
		siteTitle={title}
		siteDescription={siteDescription}
		socialLinks={socialLinks}
	/>
</div>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}
</style>
