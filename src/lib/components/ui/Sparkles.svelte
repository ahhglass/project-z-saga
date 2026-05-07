<script lang="ts">
	import SingleSparkle from './SingleSparkle.svelte';
	import { onMount } from 'svelte';

	interface SparkleType {
		id: string;
		createdAt: number;
		color: string;
		size: number;
		style: { top: string; left: string };
	}

	type ColorMode = 'default' | 'primary' | 'secondary';

	interface Props {
		color?: ColorMode;
		children?: import('svelte').Snippet;
	}
	let { color = 'default', children }: Props = $props();

	const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

	function generateSparkle(): SparkleType {
		return {
			id: String(random(10000, 99999)),
			createdAt: Date.now(),
			color:
				color === 'primary'
					? 'var(--color--primary)'
					: color === 'secondary'
						? 'var(--color--secondary)'
						: 'var(--color--yellow)',
			size: random(10, 20),
			style: {
				top: random(-10, 80) + '%',
				left: random(0, 100) + '%'
			}
		};
	}

	let sparkles = $state<SparkleType[]>([]);

	onMount(() => {
		const interval = setInterval(() => {
			const now = Date.now();
			const sparkle = generateSparkle();
			sparkles = sparkles
				.filter((s) => now - s.createdAt < 1500)
				.concat(sparkle);
		}, 400);
		return () => clearInterval(interval);
	});
</script>

<div class="sparkle-wrapper">
	{#each sparkles as sparkle (sparkle.id)}
		<SingleSparkle color={sparkle.color} size={sparkle.size} style={sparkle.style} />
	{/each}
	<span class="slot-wrapper">
		{#if children}{@render children()}{/if}
	</span>
</div>

<style lang="scss">
	.sparkle-wrapper {
		position: relative;
		display: inline-block;
	}

	.slot-wrapper {
		position: relative;
		z-index: 1;
	}
</style>
