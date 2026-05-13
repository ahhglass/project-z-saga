<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { get } from 'svelte/store';
	import '@fontsource/ubuntu-mono/latin.css';
	import '@fontsource/ubuntu-mono/latin-italic.css';
	import '$lib/scss/global.scss';
	import { page } from '$app/stores';
	import { description as defaultDesc, image as defaultImage, keywords as defaultKeywords, title as defaultTitle, siteBaseUrl as defaultBaseUrl } from '$lib/data/meta';
	import type { SiteSettings } from './+layout.server';
	import { parseSocialLinks } from '$lib/utils/types';

	interface Props {
		data: { settings?: SiteSettings | null };
		children: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

	const baseUrl = $derived(
		(data?.settings?.site_base_url || defaultBaseUrl).replace(/\/$/, '') || defaultBaseUrl.replace(/\/$/, '')
	);
	const description = $derived(data?.settings?.site_description || defaultDesc);
	const title = $derived(data?.settings?.site_title || defaultTitle);
	const image = $derived(
		data?.settings?.site_image
			? (data.settings.site_image.startsWith('http') ? data.settings.site_image : `${baseUrl}/${data.settings.site_image.replace(/^\//, '')}`)
			: defaultImage
	);
	const keywords = $derived(
		(() => {
			const raw = data?.settings?.site_keywords;
			if (!raw) return defaultKeywords;
			try {
				const arr = JSON.parse(raw);
				return Array.isArray(arr) ? arr : defaultKeywords;
			} catch {
				return defaultKeywords;
			}
		})()
	);
	const serverIp = $derived(data?.settings?.server_ip || '');
	const footerTeamLabel = $derived(data?.settings?.footer_team_label ?? '');
	const footerTeamUrl = $derived(data?.settings?.footer_team_url ?? '');
	const footerSlogan = $derived(data?.settings?.footer_slogan ?? '');
	const footerDisclaimer = $derived(data?.settings?.footer_disclaimer ?? '');
	const socialLinks = $derived(parseSocialLinks(data?.settings?.social_links));

	import Header from '$layout/Header.svelte';
	import Footer from '$layout/Footer.svelte';
	import Modal from '$blocks/Modal.svelte';
	import ServerAddressPopup from '$blocks/ServerAddressPopup.svelte';
	import { serverModalOpen } from '$lib/stores/serverModal';
	import { initSound, soundManager } from '$lib/utils/sound';

	onMount(() => {
		initSound();
	});

	afterNavigate(() => {
		if (!browser || typeof document === 'undefined') return;
		if (get(serverModalOpen)) return;
		document.body.style.removeProperty('overflow');
	});

	let open = $state(false);
	let prevOpen = $state(false);
	$effect(() => {
		const unsub = serverModalOpen.subscribe((v) => {
			open = v;
		});
		return unsub;
	});
	$effect(() => {
		if (open && !prevOpen) soundManager.playSound('popupOpen');
		prevOpen = open;
	});
</script>

<div class="layout-wrap" class:admin-route={$page.url.pathname.startsWith('/admin')}>
	<div class="layout-bg" aria-hidden="true"></div>
	<div class="layout-body">
		<Header
			showBackground
			siteTitle={title}
			links={[
				{ href: '/', label: 'Home' },
				{ href: '/news', label: 'News' },
				{ href: '/wiki', label: 'Wiki' },
				{ href: '/team', label: 'Team' },
				{ href: '/faq', label: 'FAQ' },
				{ href: 'https://theprojectzsaga.guildtag.com/shop/', label: 'Store' }
			]}
		/>
		<main class="main-content">
			<div class="main-content-panel">
				{@render children()}
			</div>
		</main>
		<div class="footer-wrap">
			<Footer
				teamLabel={footerTeamLabel}
				teamUrl={footerTeamUrl}
				slogan={footerSlogan}
				disclaimer={footerDisclaimer}
				socialLinks={socialLinks}
			/>
		</div>
	</div>

	<Modal open={open} onclose={() => serverModalOpen.set(false)}>
		<ServerAddressPopup serverIp={serverIp} onClose={() => serverModalOpen.set(false)} />
	</Modal>
</div>

<svelte:head>
	{#if true}
		{@const pathname = $page.url.pathname || '/'}
		{@const canonicalUrl = pathname === '/' ? `${baseUrl}/` : `${baseUrl}${pathname}`}
		<link rel="canonical" href={canonicalUrl} />
		<meta name="keywords" content={keywords.join(', ')} />
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
		<meta property="og:url" content={canonicalUrl} />
		<meta property="og:type" content="website" />
		<meta property="og:site_name" content={title} />
		<meta name="twitter:description" content={description} />
		<title>{title}</title>
		<meta property="og:title" content={title} />
		<meta name="twitter:title" content={title} />
		<meta property="og:image" content={image} />
		<meta name="twitter:image" content={image} />
		<meta name="twitter:card" content="summary_large_image" />
	{/if}
</svelte:head>

<style lang="scss">
	@use '$lib/scss/breakpoints' as *;

	.layout-wrap {
		position: relative;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.layout-bg {
		position: fixed;
		inset: 0;
		z-index: 0;
		background-image: url('/images/bg.webp');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		opacity: 0.25;
		filter: blur(2px);
		pointer-events: none;
	}

	.layout-body {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		flex: 1 0 auto;
		min-height: 100vh;
	}

	.main-content {
		position: relative;
		z-index: 1;
		flex: 1 0 auto;
		width: 100%;
		padding: 0 1rem;

		@include for-phone-only {
			padding-left: 0.75rem;
			padding-right: 0.75rem;
		}
	}

	.main-content-panel {
		max-width: 1080px;
		margin: 0 auto;
		padding: 2rem 1rem;
		background-color: var(--color--main-content);
	}

	@include for-phone-only {
		.main-content-panel {
			padding-left: 0.75rem;
			padding-right: 0.75rem;
		}
	}

	/* Admin: full width, no panel background */
	.layout-wrap.admin-route .main-content-panel {
		max-width: none;
		background-color: transparent;
	}
	@include for-phone-only {
		.layout-wrap.admin-route .main-content {
			padding-left: 0;
			padding-right: 0;
		}
		.layout-wrap.admin-route .main-content-panel {
			padding-left: 0;
			padding-right: 0;
		}
	}

	.footer-wrap {
		flex-shrink: 0;
	}
</style>
