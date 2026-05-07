<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import { browser } from '$app/environment';
	import { sound } from '$lib/utils/sound';

	// Unique id for SVG mask so multiple ThemeToggle instances (e.g. header + mobile menu) don't clash
	const maskId = 'theme-moon-' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10));

	// Sync with data-theme set by inline script in app.html to avoid toggle flicker on load
	const initialTheme =
		browser && typeof document !== 'undefined'
			? (document.documentElement.getAttribute('data-theme') || 'auto')
			: 'auto';

	let themeValue = $state(initialTheme);
	$effect(() => {
		const unsub = theme.subscribe((v) => {
			themeValue = v;
		});
		return unsub;
	});

	function toggleTheme() {
		if (themeValue === 'auto') {
			theme.set('light');
		} else if (themeValue === 'light') {
			theme.set('dark');
		} else {
			theme.set('auto');
		}
	}
</script>

<noscript>
	<style>
		.theme-toggle {
			display: none !important;
		}
	</style>
</noscript>

<button
	class="theme-toggle"
	title="Toggle between light and dark theme"
	data-theme={themeValue}
	onclick={toggleTheme}
	use:sound
>
	<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
		<mask id={maskId} class="theme-moon-mask">
			<rect x="0" y="0" width="100%" height="100%" fill="white" />
			<circle class="theme-moon-cut" cx="40" cy="8" r="11" fill="black" />
		</mask>
		<circle id="theme-sun" cx="12" cy="12" r="11" mask={"url(#" + maskId + ")"} />
		<g id="theme-sun-beams">
			<line x1="12" y1="1" x2="12" y2="3" />
			<line x1="12" y1="21" x2="12" y2="23" />
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
			<line x1="1" y1="12" x2="3" y2="12" />
			<line x1="21" y1="12" x2="23" y2="12" />
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
		</g>
	</svg>
	<span class="label">{themeValue === 'auto' ? 'Auto' : themeValue === 'light' ? 'Light' : 'Dark'}</span>
</button>

<style lang="scss">
	.theme-toggle {
		height: 24px;
		padding: 0;
		appearance: none;
		border: none;
		background: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 5px;
		transition: transform 0.2s var(--ease-out-3);

		&:active {
			transform: scale(0.92);
		}

		&:hover .label {
			color: var(--color--primary);
		}

		&:hover .theme-moon-mask,
		&:hover #theme-sun {
			fill: var(--color--primary);
		}

		&:hover #theme-sun-beams {
			stroke: var(--color--primary);

			line {
				filter: drop-shadow(0px 0px 3px var(--color--primary));
			}
		}

		&:not([data-theme]) #theme-sun,
		&[data-theme='light'] #theme-sun {
			transform: scale(0.5);
		}

		&:not([data-theme]) #theme-sun-beams,
		&[data-theme='light'] #theme-sun-beams {
			transform: rotateZ(0.25turn);
		}

		&[data-theme='dark'] .theme-moon-cut {
			transform: translateX(-20px);
		}

		&[data-theme='dark'] #theme-sun-beams {
			opacity: 0;
		}

		&[data-theme='auto'] .label,
		&[data-theme='light'] .label,
		&[data-theme='dark'] .label {
			opacity: 1;
			transform: scaleX(1);
			max-width: 36px;
		}

		@media not all and (prefers-color-scheme: dark) {
			&[data-theme='auto'] #theme-sun {
				transform: scale(0.5);
			}

			&[data-theme='auto'] #theme-sun-beams {
				transform: rotateZ(0.25turn);
			}
		}

		@media (prefers-color-scheme: dark) {
			&[data-theme='auto'] .theme-moon-cut {
				transform: translateX(-20px);
			}

			&[data-theme='auto'] #theme-sun-beams {
				opacity: 0;
			}
		}
	}

	.label {
		transition: all 0.5s var(--ease-4);
		text-transform: uppercase;
		font-size: 0.6rem;
		opacity: 0;
		transform-origin: left;
		transform: scaleX(0);
		max-width: 0;
		color: var(--color--text);
	}

	.theme-moon-mask,
	#theme-sun {
		fill: var(--color--text);
		stroke: none;
	}

	#theme-sun {
		transition: all 0.5s var(--ease-4);
		transform-origin: center center;
	}

	#theme-sun-beams {
		stroke: var(--color--text);
		stroke-width: 2px;
		transform-origin: center center;
		transition: all 0.5s var(--ease-elastic-4), opacity 0.15s var(--ease-3);
	}

	.theme-moon-cut {
		transition: all 0.5s var(--ease-out-3);
	}
</style>
