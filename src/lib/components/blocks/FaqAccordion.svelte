<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { FaqItem } from '$lib/data/faq';
	import { sound } from '$lib/utils/sound';
	import { ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon } from '$lib/icons';

	interface Props {
		item: FaqItem;
		open?: boolean;
		onToggle?: () => void;
	}

	let { item, open = false, onToggle }: Props = $props();
</script>

<div class="accordion" class:open>
	<button
		type="button"
		class="trigger"
		aria-expanded={open}
		aria-controls="faq-{item.id}"
		id="faq-trigger-{item.id}"
		onclick={onToggle}
		use:sound
	>
		<span class="question">{item.question}</span>
		<span class="meta">
			<span class="tag">{item.tag}</span>
			<span class="icon" aria-hidden="true">
				{#if open}
					<ArrowUpIcon />
				{:else}
					<ArrowDownIcon />
				{/if}
			</span>
		</span>
	</button>
	{#if open}
		<div
			id="faq-{item.id}"
			role="region"
			aria-labelledby="faq-trigger-{item.id}"
			class="content"
			transition:slide={{ duration: 280, easing: (t) => t * (2 - t) }}
		>
			<p class="answer">{item.answer}</p>
		</div>
	{/if}
</div>

<style lang="scss">
	@use '$lib/scss/breakpoints' as *;
	@use '$lib/scss/fluid' as *;

	.accordion {
		margin-bottom: 10px;

		@include for-phone-only {
			margin-bottom: 8px;
		}
	}

	.trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;

		@include for-phone-only {
			gap: 8px;
			padding: 10px 12px !important;
		}
	}

	.question {
		flex: 1;
		min-width: 0;
		word-break: break-word;
		overflow-wrap: break-word;
		@include fluid-text(0.75rem, 1.36rem);
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-shrink: 0;

		@include for-phone-only {
			gap: 8px;
		}
	}

	.tag {
		font-family: 'MinecraftSeven', sans-serif;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		padding: 4px 8px;
		border-radius: 0;
		border: 1px solid var(--mc-hr-bottom);
		background: var(--color--team-badge-bg);
		color: var(--color--team-badge-text);

		@include for-phone-only {
			font-size: 0.625rem;
			padding: 3px 6px;
		}
	}

	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		color: var(--color--text-shade);

		:global(svg) {
			width: 100%;
			height: 100%;
		}
	}

	.content {
		padding: 0 16px 12px;
		overflow: hidden;

		@include for-phone-only {
			padding: 0 12px 10px;
		}
	}

	.answer {
		margin: 0;
		padding-top: 4px;
		@include fluid-text(0.65rem, 1.224rem);
		line-height: 1.5;
		word-break: break-word;
		overflow-wrap: break-word;
	}
</style>
