<script lang="ts">
	import { onMount } from 'svelte';
	import TeamMemberCard from '$blocks/TeamMemberCard.svelte';
	import type { TeamSection } from '$lib/data/team';
	import type { SiteSettings } from '../+layout.server';
	import { title as defaultTitle } from '$lib/data/meta';

	interface Props {
		data: { settings?: SiteSettings | null; sections?: TeamSection[] };
	}

	let { data }: Props = $props();

	const sections = $derived(data?.sections ?? []);
	const siteTitle = $derived(data?.settings?.site_title ?? defaultTitle);

	// CSS animation runs after hydration (Svelte transitions don't fire on SSR)
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});
</script>

<svelte:head>
	<title>Team — {siteTitle}</title>
	<meta name="description" content="Meet the team." />
</svelte:head>

<div class="container team-page">
	<header class="team-header mc-card">
		<p class="label">MEET OUR</p>
		<h1 class="title">Team</h1>
	</header>

	{#each sections as section}
		<section class="team-section mc-card" id={section.id}>
			<h2 class="section-title">{section.title}</h2>
			<div class="cards-grid" class:mounted>
				{#each section.members as member, i}
					<div
						class="card-item"
						style="--i: {i}"
					>
						<TeamMemberCard member={member} />
					</div>
				{/each}
			</div>
		</section>
	{/each}
</div>

<style lang="scss">
	@use '$lib/scss/breakpoints' as *;
	@use '$lib/scss/fluid' as *;

	.team-header {
		text-align: center;
		margin-bottom: 48px;

		.label {
			@include fluid-text(0.6rem, 1.19rem);
			letter-spacing: 0.15em;
			color: var(--color--text-shade);
			margin: 0 0 8px;

			@include for-phone-only {
				font-size: 0.6875rem;
				letter-spacing: 0.1em;
				margin-bottom: 4px;
			}
		}

		.title {
			font-family: var(--font--title);
			margin: 0 0 16px;
			color: var(--color--text);
			@include fluid-text(1.4rem, 3.06rem);

			@include for-phone-only {
				font-size: 1.5rem;
			}
		}
	}

	.team-section {
		margin-bottom: 48px;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.section-title {
		@include fluid-text(0.9rem, 1.7rem);
		font-weight: 600;
		color: var(--color--text);
		margin: 0 0 20px;
		padding-bottom: 8px;
		border-bottom: 3px;
		position: relative;
		display: inline-block;
	}

	.section-title::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 128%;
		height: 3px;
		background: linear-gradient(to right, var(--color--primary), transparent);
	}

	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 24px;
		justify-items: center;

		@include for-phone-only {
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;
		}

		.card-item {
			opacity: 0;
			width: 100%;
			max-width: 300px;
		}

		&.mounted .card-item {
			animation: card-fade-in 0.4s ease-out forwards;
			animation-delay: calc(var(--i) * 90ms);
		}
	}

	@media screen and (prefers-reduced-motion: reduce) {
		.cards-grid.mounted .card-item {
			animation: none;
			opacity: 1;
		}
	}

	@keyframes card-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
