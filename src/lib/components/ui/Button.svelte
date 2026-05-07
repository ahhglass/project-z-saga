<script lang="ts">
	import { HttpRegex } from '$lib/utils/regex';
	import { sound } from '$lib/utils/sound';

	interface Props {
		color?: 'primary' | 'secondary' | 'tertiary' | 'normal' | 'curseforge';
		style?: 'solid' | 'understated' | 'clear';
		size?: 'small' | 'medium' | 'large';
		href?: string;
		target?: '_self' | '_blank';
		rel?: string;
		additionalClass?: string;
	children?: import('svelte').Snippet;
	icon?: import('svelte').Snippet;
		onclick?: (e: MouseEvent) => void;
	}

	let {
		color = 'primary',
		style: styleProp = 'solid',
		size = 'medium',
		href,
		target: targetProp,
		rel: relProp,
		additionalClass,
		children,
		icon,
		onclick
	}: Props = $props();

	const isExternalLink = $derived(!!href && HttpRegex.test(href));
	const target = $derived(targetProp ?? (isExternalLink ? '_blank' : '_self'));
	const rel = $derived(relProp ?? (isExternalLink ? 'noopener noreferrer' : undefined));

	const tag = $derived(href ? 'a' : 'button');
	const linkProps = $derived(href ? { href, target, rel } : {});
	const mcButtonVariant = $derived(
		color === 'primary'
			? 'mc-button-primary'
			: color === 'secondary'
				? 'mc-button-secondary'
				: color === 'tertiary'
					? 'mc-button-tertiary'
					: color === 'normal'
						? 'mc-button-normal'
						: 'mc-button-normal'
	);
	const classList = $derived(
	['button', 'mc-button', mcButtonVariant, `style--${styleProp}`, `size--${size}`, `color--${color}`, additionalClass]
		.filter(Boolean)
		.join(' ')
	);
	const elementAttrs = $derived({ class: classList });
</script>

<svelte:element
	this={tag}
	{...elementAttrs}
	data-sveltekit-preload-data
	{...linkProps}
	{onclick}
	use:sound
>
	{#if icon}
		<div class="icon">
			{@render icon()}
		</div>
	{/if}
	{#if children}{@render children()}{/if}
</svelte:element>

<style lang="scss">
	/* Base layout for all buttons (MC and non-MC) */
	.button {
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
		text-decoration: none;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		border-radius: var(--mc-radius, 0);
		font-weight: 700;

		.icon {
			width: 24px;
			height: 24px;
		}

		&.color--primary {
			--main-color: var(--color--primary-rgb);
			--light-color: var(--color--primary-tint-rgb);
			--contrast-color: var(--color--primary-contrast);
		}

		&.color--secondary {
			--main-color: var(--color--secondary-rgb);
			--light-color: var(--color--secondary-tint-rgb);
			--contrast-color: var(--color--secondary-contrast);
		}

		&.color--curseforge {
			--main-color: var(--color--curseforge-rgb);
			--light-color: var(--color--curseforge-tint-rgb);
			--contrast-color: var(--color--curseforge-contrast);
		}
	}

	/* Non-MC buttons only: transition, border, active, hover, size (so MC animation is not overridden) */
	.button:not(.mc-button) {
		border: none;
		transition:
			color 0.35s var(--ease-4),
			background-color 0.35s var(--ease-4),
			box-shadow 0.35s var(--ease-4),
			transform 0.2s var(--ease-out-3);

		&:active {
			transform: scale(0.98);
		}

		&.style--solid {
			background-color: rgb(var(--main-color));
			color: var(--contrast-color);

			&:hover {
				box-shadow: 0px 0px 1px 3px rgba(var(--main-color), 0.3);
			}
		}

		&.style--understated {
			background-color: rgb(var(--light-color));
			color: rgb(var(--main-color));

			&:hover {
				box-shadow: 0px 0px 1px 3px rgba(var(--main-color), 0.3);
			}
		}

		&.style--clear {
			background-color: transparent;
			color: rgb(var(--main-color));

			&:hover {
				background-color: rgb(var(--light-color));
			}
		}

		&.size--small {
			padding: 5px 10px;
			font-size: 0.75rem;

			.icon {
				width: 20px;
				height: 20px;
			}
		}

		&.size--medium {
			padding: 10px 20px;
			font-size: 1rem;
		}

		&.size--large {
			padding: 15px 30px;
			font-size: 1.15rem;

			.icon {
				width: 28px;
				height: 28px;
			}
		}
	}
</style>
