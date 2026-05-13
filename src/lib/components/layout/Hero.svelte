<script lang="ts">
	import { Playnow as PlayNowIcon, Discord as DiscordIcon } from '$lib/icons';
	import Button from '$ui/Button.svelte';
	import Sparkles from '$ui/Sparkles.svelte';
	import { serverModalOpen } from '$lib/stores/serverModal';

	interface Props {
		heroTitle?: string;
		heroSubtitle?: string;
	}

	// Defaults from DB (Admin → Settings). Fallbacks for PZS when empty.
	const defaultTitle = 'Project Z Saga';
	const defaultSubtitle = 'A Dragon Ball–Inspired Minecraft MMORPG. Ki combat, quests, races & tournaments — no mods required.';
	let { heroTitle = '', heroSubtitle = '' }: Props = $props();
	const title = $derived(heroTitle?.trim() || defaultTitle);
	const subtitle = $derived(heroSubtitle?.trim() || defaultSubtitle);
</script>

<section id="hero" class="mc-card mc-hero">
	<div class="mc-card-body">
	<h1 class="hello">{title}</h1>
	<p class="intro">
		<span>{subtitle}</span>
	</p>
	<div class="ctas">
		<Sparkles>
			<Button href="https://discord.gg/Z63vRU8zkY">
				{#snippet icon()}
					<DiscordIcon />
				{/snippet}
				Discord
			</Button>
		</Sparkles>
		<Button color="primary" onclick={() => serverModalOpen.set(true)}>
			{#snippet icon()}
				<PlayNowIcon />
			{/snippet}
			Play Now
		</Button>
	</div>
	</div>
</section>

<style lang="scss">
	@use '$lib/scss/breakpoints' as *;
	@use '$lib/scss/fluid' as *;

	#hero.mc-hero {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 15px;
		position: relative;
		@include fluid-size(padding, 2.5rem, 5rem);
	}
	#hero.mc-hero .mc-card-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
		width: 100%;
	}

	.hello {
		font-family: var(--font--title);
		font-weight: 900;
		text-align: center;
		text-shadow: 2px 2px 0px rgba(10, 74, 8, 0.9), -1px -1px 0px rgba(74, 44, 122, 0.6);
		@include fluid-text(1rem, 4.08rem);
	}

	.intro {
		font-weight: 500;
		@include fluid-text(0.8rem, 1.7rem);
		width: min(100%, 440px);
		display: flex;
		flex-direction: column;
		text-align: center;
	}

	.ctas {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 10px;
		width: 100%;

		@include for-phone-only {
			flex-wrap: nowrap;
			gap: 8px;
		}

		:global(.button.color--primary) {
			white-space: nowrap;
		}
	}
</style>
