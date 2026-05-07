<script lang="ts">
	import Sparkles from '$ui/Sparkles.svelte';

	type Color = 'default' | 'primary' | 'secondary';

	interface Props {
		color?: Color;
		sparkleColor?: Color;
		children?: import('svelte').Snippet;
	}

	let { color = 'default', sparkleColor = 'default', children }: Props = $props();
</script>

<Sparkles color={sparkleColor}>
	<strong class={color}>
		{#if children}{@render children()}{/if}
	</strong>
</Sparkles>

<style lang="scss">
	strong {
		&.primary {
			color: var(--color--primary);
		}
		&.secondary {
			color: var(--color--secondary);
		}
	}
</style>
