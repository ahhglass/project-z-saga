<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$ui/Button.svelte';

	const status = $derived($page.status ?? 500);
	const error = $derived($page.error);

	const title = $derived(status === 404 ? 'Error 404' : 'Error');
	// "This page was lost in the Soul Society. It can't be displayed." / "It seems like coffee was spilled..."
	const message = $derived(
		status === 404
			? "This page can't be displayed."
			: "Something went wrong. This page can't be displayed."
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="error-page">
	<div class="container">
		<h1>{title}</h1>
		<div class="img-wrapper">
			<img src="/images/error-ichigo.webp" alt="Ichigo Kurosaki" />
		</div>
		<p>{message}</p>
		{#if error?.message && status >= 500}
			<p class="error-detail">{error.message}</p>
		{/if}
		<br />
		<Button href="/">Start over</Button>
	</div>
</div>

<style lang="scss">
	.error-page {
		position: relative;
		width: 100%;
		max-width: 1080px;
		margin: 0 auto;
	}

	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;

		h1 {
			font-family: var(--font--title);
			font-size: clamp(1.5rem, 4vw, 2.25rem);
			margin: 0 0 1rem;
			color: var(--color--text);
		}

		p {
			margin: 0;
			line-height: 1.5;
			color: var(--color--text-shade);
			max-width: 36ch;
		}

		.error-detail {
			margin-top: 0.5rem;
			font-size: 0.9rem;
			opacity: 0.9;
		}

		.img-wrapper {
			width: 320px;
			max-width: 80vw;
			margin-top: -20px;

			:global(svg) {
				width: 100%;
				height: auto;
				filter: drop-shadow(2px 6px 0px rgba(0, 0, 0, 0.1));
			}
		}
	}
</style>
