<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import Logo from '$ui/Logo.svelte';
	import ThemeToggle from '$blocks/ThemeToggle.svelte';
	import { sound, toggleSound, soundEnabledStore } from '$lib/utils/sound';
	import { randomSplash } from '$lib/data/splashes';

	interface NavLink {
		href: string;
		label: string;
	}

	interface Props {
		showBackground?: boolean;
		links?: NavLink[];
		/** From DB (site_title) for logo. */
		siteTitle?: string;
	}

	let { showBackground = false, links = [], siteTitle = '' }: Props = $props();

	const navLinks = $derived(links.length > 0 ? links : [{ href: '/', label: 'Home' }]);

	let mobileOpen = $state(false);
	let menuToggleEl = $state<HTMLButtonElement | null>(null);
	let splashText = $state('');

	function toggleMobile() {
		mobileOpen = !mobileOpen;
	}

	function closeMobile() {
		menuToggleEl?.focus({ preventScroll: true });
		mobileOpen = false;
	}

	function handleMobileNavClick(e: MouseEvent, href: string) {
		e.preventDefault();
		closeMobile();
		if (!browser) return;
		try {
			const url = new URL(href, window.location.href);
			if (url.origin !== window.location.origin) {
				window.location.href = url.href;
				return;
			}
		} catch {
			/* fall through to goto */
		}
		goto(href);
	}

	function handleToggleSound(): void {
		toggleSound();
	}

	function handleSoundKeyDown(e: KeyboardEvent): void {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleToggleSound();
		}
	}

	onMount(() => {
		if (!browser) return;
		splashText = randomSplash();
		return () => {
			document.body.style.overflow = '';
		};
	});

	$effect(() => {
		if (!browser || typeof document === 'undefined') return;
		document.body.style.overflow = mobileOpen ? 'hidden' : '';
	});

	$effect(() => {
		if (!browser || !mobileOpen || typeof window === 'undefined') return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeMobile();
		};
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	});
</script>

<header class="header mc-navbar" class:has-background={showBackground}>
	<nav class="container" aria-label="Main navigation">
		<div class="logo-wrap">
			<a class="logo mc-navbar-brand" href="/" aria-label="Site logo" use:sound>
				<Logo siteTitle={siteTitle} />
			</a>
			{#if splashText}
				<span class="splash" aria-hidden="true">{splashText}</span>
			{/if}
		</div>

		<div class="links mc-navbar-nav">
			{#each navLinks as item}
				<a href={item.href} onclick={closeMobile} use:sound>{item.label}</a>
			{/each}
			<ThemeToggle />
		</div>

		<button
			type="button"
			class="menu-toggle"
			bind:this={menuToggleEl}
			use:sound
			aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
			aria-expanded={mobileOpen}
			aria-controls="mobile-menu"
			onclick={toggleMobile}
		>
			<span class="menu-icon" class:open={mobileOpen} aria-hidden="true">
				<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-width="1.5">
					<path d="M3 5H21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
					<path d="M3 12H21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
					<path d="M3 19H21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</span>
			<span class="close-icon" class:open={mobileOpen} aria-hidden="true">
				<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-width="1.5">
					<path d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</span>
		</button>
	</nav>

	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		id="mobile-menu"
		class="mobile-overlay"
		class:open={mobileOpen}
		role="dialog"
		aria-modal="true"
		aria-label="Mobile menu"
		aria-hidden={!mobileOpen}
		onclick={(e) => e.target === e.currentTarget && closeMobile()}
	>
		<div class="mobile-panel" role="presentation" onclick={(e) => e.stopPropagation()}>
			<nav class="mobile-nav" aria-label="Mobile navigation">
				{#each navLinks as item}
					<a href={item.href} onclick={(e) => handleMobileNavClick(e, item.href)} use:sound>{item.label}</a>
				{/each}
				<div class="mobile-nav-actions">
					<button
						type="button"
						class="mobile-sound-toggle"
						use:sound
						onclick={handleToggleSound}
						onkeydown={handleSoundKeyDown}
						aria-label={$soundEnabledStore ? 'Mute' : 'Unmute'}
					>
						<svg class="sound-icon" class:visible={$soundEnabledStore} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M10.4 1.8C11.5532 0.262376 14 1.07799 14 3.00001V21.1214C14 23.0539 11.5313 23.8627 10.3878 22.3049L6.49356 17H4C2.34315 17 1 15.6569 1 14V10C1 8.34315 2.34315 7 4 7H6.5L10.4 1.8ZM12 3L8.1 8.2C7.72229 8.70361 7.12951 9 6.5 9H4C3.44772 9 3 9.44772 3 10V14C3 14.5523 3.44772 15 4 15H6.49356C7.13031 15 7.72901 15.3032 8.10581 15.8165L12 21.1214V3Z" fill="currentColor" />
							<path d="M16.2137 4.17445C16.1094 3.56451 16.5773 3 17.1961 3C17.6635 3 18.0648 3.328 18.1464 3.78824C18.4242 5.35347 19 8.96465 19 12C19 15.0353 18.4242 18.6465 18.1464 20.2118C18.0648 20.672 17.6635 21 17.1961 21C16.5773 21 16.1094 20.4355 16.2137 19.8256C16.5074 18.1073 17 14.8074 17 12C17 9.19264 16.5074 5.8927 16.2137 4.17445Z" fill="currentColor" />
							<path d="M21.41 5C20.7346 5 20.2402 5.69397 20.3966 6.35098C20.6758 7.52413 21 9.4379 21 12C21 14.5621 20.6758 16.4759 20.3966 17.649C20.2402 18.306 20.7346 19 21.41 19C21.7716 19 22.0974 18.7944 22.2101 18.4509C22.5034 17.5569 23 15.5233 23 12C23 8.47672 22.5034 6.44306 22.2101 5.54913C22.0974 5.20556 21.7716 5 21.41 5Z" fill="currentColor" />
						</svg>
						<svg class="sound-icon" class:visible={!$soundEnabledStore} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M14 3.00001C14 1.07799 11.5532 0.262376 10.4 1.8L6.5 7H4C2.34315 7 1 8.34315 1 10V14C1 15.6569 2.34315 17 4 17H6.49356L10.3878 22.3049C11.5313 23.8627 14 23.0539 14 21.1214V3.00001ZM8.1 8.2L12 3V21.1214L8.10581 15.8165C7.72901 15.3032 7.13031 15 6.49356 15H4C3.44772 15 3 14.5523 3 14V10C3 9.44772 3.44772 9 4 9H6.5C7.12951 9 7.72229 8.70361 8.1 8.2Z" fill="currentColor" />
							<path d="M21.2929 8.57094C21.6834 8.18041 22.3166 8.18042 22.7071 8.57094C23.0976 8.96146 23.0976 9.59463 22.7071 9.98515L20.7603 11.9319L22.7071 13.8787C23.0976 14.2692 23.0976 14.9024 22.7071 15.2929C22.3166 15.6834 21.6834 15.6834 21.2929 15.2929L19.3461 13.3461L17.3994 15.2929C17.0088 15.6834 16.3757 15.6834 15.9852 15.2929C15.5946 14.9023 15.5946 14.2692 15.9852 13.8787L17.9319 11.9319L15.9852 9.98517C15.5946 9.59464 15.5946 8.96148 15.9852 8.57096C16.3757 8.18043 17.0088 8.18043 17.3994 8.57096L19.3461 10.5177L21.2929 8.57094Z" fill="currentColor" />
						</svg>
						<span class="mobile-sound-label">{$soundEnabledStore ? 'Mute' : 'Unmute'}</span>
					</button>
					<div class="mobile-nav-theme">
						<ThemeToggle />
					</div>
				</div>
			</nav>
		</div>
	</div>
</header>

<style lang="scss">
	@use '$lib/scss/breakpoints' as *;

	.header {
		color: var(--color--text);
		position: relative;
		padding: 30px 0;
		z-index: 100;

		&.mc-navbar {
			padding: 8px 16px;
		}

		@include for-phone-only {
			padding: 20px 0;
			&.mc-navbar {
				padding: 8px 12px;
			}
		}

		@include for-iphone-se {
			padding: 1rem 0;
		}

		a {
			color: var(--color--text);
		}

		.container {
			display: flex;
			align-items: center;
			gap: 30px;
			max-width: 1080px;
			margin: 0 auto;
			padding: 0 15px;

			@include for-phone-only {
				padding: 0 0.75rem;
			}

			@include for-iphone-se {
				padding: 0 0.5rem;
			}
		}

		.logo-wrap {
			flex: 1;
			display: flex;
			align-items: center;
			gap: 2px;
			min-width: 0;
		}

		.logo {
			height: 44px;
			display: block;
			flex-shrink: 0;

			:global(svg) {
				height: 100%;
				width: auto;
			}

			@include for-phone-only {
				height: 38px;
			}
		}

		.splash {
			display: inline-block;
			font-family: 'MinecraftSeven', sans-serif;
			font-size: 0.6rem;
			font-weight: normal;
			color: #ffff00;
			text-shadow: 1px 1px 0 #000;
			transform: rotate(20deg);
			white-space: nowrap;
			pointer-events: none;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 140px;
			margin-left: -26%;
			margin-top: -12px;

			@media (prefers-reduced-motion: no-preference) {
				animation: splash-pulse 0.25s ease-in-out alternate infinite;
			}

			@include for-phone-only {
				font-size: 0.6rem;
				max-width: 100px;
			}
		}

		@keyframes splash-pulse {
			0% {
				transform: scale(0.875) rotate(20deg);
			}
			100% {
				transform: scale(1) rotate(20deg);
			}
		}

		.links {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 30px;

			@include for-phone-only {
				display: none !important;
			}

			a {
				text-decoration: none;
				transition: color 0.35s var(--ease-4), filter 0.35s var(--ease-4);

				&:hover {
					color: var(--color--primary);
					filter: drop-shadow(0px 0px 3px var(--color--primary));
				}

				&:active {
					opacity: 0.85;
				}
			}
		}

		.menu-toggle {
			display: none;
			align-items: center;
			justify-content: center;
			width: 2.75rem;
			height: 2.75rem;
			min-width: 2.75rem;
			min-height: 2.75rem;
			padding: 0;
			border: none;
			background: transparent;
			cursor: pointer;
			position: relative;
			color: var(--color--text);
			border-radius: 8px;
			transition: background-color 0.2s ease, color 0.2s ease;

			@include for-phone-only {
				display: flex !important;
			}

			&:hover {
				color: var(--color--primary);
				background: rgba(var(--color--primary-rgb, 54, 172, 48), 0.08);
			}

			&:active {
				background: rgba(var(--color--primary-rgb, 54, 172, 48), 0.12);
			}

			.menu-icon,
			.close-icon {
				position: absolute;
				inset: 0;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: opacity 0.2s var(--ease-4), transform 0.2s var(--ease-4);

				svg {
					width: 1.5rem;
					height: 1.5rem;
				}
			}

			.menu-icon {
				opacity: 1;
				transform: scale(1) rotate(0deg);

				&.open {
					opacity: 0;
					transform: scale(0.8) rotate(-90deg);
					pointer-events: none;
				}
			}

			.close-icon {
				opacity: 0;
				transform: scale(0.8) rotate(90deg);
				pointer-events: none;

				&.open {
					opacity: 1;
					transform: scale(1) rotate(0deg);
					pointer-events: auto;
				}
			}
		}

		.mobile-overlay {
			position: fixed;
			inset: 0;
			z-index: 99;
			background: rgba(0, 0, 0, 0.4);
			backdrop-filter: blur(4px);
			-webkit-backdrop-filter: blur(4px);
			visibility: hidden;
			opacity: 0;
			transition: visibility 0.3s var(--ease-4), opacity 0.3s var(--ease-4);

			@include for-tablet-portrait-up {
				display: none !important;
			}

			&.open {
				visibility: visible;
				opacity: 1;
			}
		}

		.mobile-panel {
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			width: min(280px, 85vw);
			background: var(--color--page-background);
			box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
			transform: translateX(100%);
			transition: transform 0.3s cubic-bezier(0.33, 1, 0.68, 1);
		}

		.mobile-overlay.open .mobile-panel {
			transform: translateX(0);
		}

		.mobile-nav {
			display: flex;
			flex-direction: column;
			gap: 0;
			padding: 5rem 1.25rem 1.5rem;
			height: 100%;
			box-sizing: border-box;

			a {
				display: block;
				text-decoration: none;
				color: var(--color--text);
				font-size: 1.125rem;
				font-weight: 500;
				padding: 0.75rem 0;
				border-bottom: 1px solid var(--color--code-inline-background);
				transition: color 0.2s ease, background-color 0.15s ease;
				word-break: break-word;

				&:hover {
					color: var(--color--primary);
					background: rgba(var(--color--primary-rgb, 54, 172, 48), 0.06);
				}

				&:active {
					background: rgba(var(--color--primary-rgb, 54, 172, 48), 0.1);
				}
			}
		}

		.mobile-nav-actions {
			margin-top: auto;
			padding-top: 1.25rem;
			border-top: 1px solid var(--color--code-inline-background);
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
		}

		.mobile-sound-toggle {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			width: 100%;
			padding: 0.75rem 0;
			background: none;
			border: none;
			color: var(--color--text);
			font-size: 1rem;
			font-weight: 500;
			font-family: inherit;
			cursor: pointer;
			text-align: left;
			transition: color 0.2s ease, background-color 0.15s ease;
			border-radius: 8px;

			&:hover {
				color: var(--color--primary);
				background: rgba(var(--color--primary-rgb, 54, 172, 48), 0.06);
			}

			&:active {
				background: rgba(var(--color--primary-rgb, 54, 172, 48), 0.1);
			}

			.sound-icon {
				width: 20px;
				height: 20px;
				flex-shrink: 0;
				display: none;

				&.visible {
					display: block;
				}
			}

			.mobile-sound-label {
				line-height: 1.2;
				font-size: 0.6rem;
				font-weight: 500;
				text-transform: uppercase;
			}
		}

	}
</style>
