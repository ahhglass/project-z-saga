<script lang="ts">
	import { browser } from '$app/environment';
	import { fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { TransitionConfig } from 'svelte/transition';

	interface Props {
		open?: boolean;
		onclose?: () => void;
		children?: import('svelte').Snippet;
	}

	type ModalParams = { duration?: number };
	const modal = (
		node: Element,
		{ duration = 400 }: ModalParams = {}
	): TransitionConfig => {
		const transform = getComputedStyle(node).transform;
		const baseTransform = transform === 'none' ? '' : transform;

		return {
			duration,
			easing: quintOut,
			css: (t, u) =>
				`transform: ${baseTransform} scale(${t}) translateY(${u * -250}%); opacity: ${t};`
		};
	};

	let { open = false, onclose, children }: Props = $props();

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open || e.key !== 'Escape') return;
		close();
	}

	function close() {
		onclose?.();
	}

	$effect(() => {
		if (browser) {
			if (open) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
			return () => {
				document.body.style.overflow = '';
			};
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="modal-overlay"
		role="dialog"
		aria-modal="true"
		aria-label="Modal"
		onclick={handleOverlayClick}
		onkeydown={handleKeydown}
		tabindex="-1"
		transition:fade={{ duration: 300 }}
	>
		<div
			class="modal-content mc-modal"
			role="document"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			transition:modal={{ duration: 600 }}
		>
			{#if children}{@render children()}{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	.modal-overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
	}

	.modal-content {
		background: var(--color--card-background);
		color: var(--color--text);
		border-radius: var(--mc-radius, 0);
		box-shadow: var(--card-shadow);
		max-width: 100%;
		max-height: 90vh;
		overflow: auto;
	}
	.modal-content.mc-modal {
		border: var(--mc-border);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}
</style>
