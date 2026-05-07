<script lang="ts">
	import { browser } from '$app/environment';
	import { soundManager, toggleSound, setSoundEnabled, soundEnabledStore } from '$lib/utils/sound';
	import { sound } from '$lib/utils/sound';

	const TOOLTIP_CLOSE_DELAY_MS = 280;
	let open = $state(false);
	let tooltipEl = $state<HTMLDivElement | null>(null);
	let volumeLevel = $state(0.5);
	let closeTimeoutId: ReturnType<typeof setTimeout> | null = null;

	function clearCloseTimeout(): void {
		if (closeTimeoutId != null) {
			clearTimeout(closeTimeoutId);
			closeTimeoutId = null;
		}
	}

	function scheduleClose(): void {
		clearCloseTimeout();
		closeTimeoutId = setTimeout(() => {
			open = false;
			closeTimeoutId = null;
		}, TOOLTIP_CLOSE_DELAY_MS);
	}

	function handleWrapperEnter(): void {
		clearCloseTimeout();
		open = true;
	}

	function handleWrapperLeave(): void {
		scheduleClose();
	}

	function handleTooltipEnter(): void {
		clearCloseTimeout();
	}

	function handleTooltipLeave(): void {
		scheduleClose();
	}

	$effect(() => {
		if (!browser) return;
		volumeLevel = soundManager.getVolume();
	});

	function handleInput(e: Event): void {
		const v = Number((e.target as HTMLInputElement).value);
		volumeLevel = v;
		soundManager.setVolume(v);
		if (v > 0) setSoundEnabled(true);
	}

	function handleToggle(): void {
		toggleSound();
	}

	function handleKeyDown(e: KeyboardEvent): void {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleToggle();
		}
		if (e.key === 'Escape' && open) open = false;
	}

	function handleClickOutside(e: MouseEvent): void {
		const target = e.target as HTMLElement;
		if (tooltipEl && !tooltipEl.contains(target) && !target.closest('.volume-control')) {
			open = false;
		}
	}

	$effect(() => {
		if (!browser || !open) return;
		const onDocClick = (e: MouseEvent) => handleClickOutside(e);
		document.addEventListener('click', onDocClick, true);
		return () => document.removeEventListener('click', onDocClick, true);
	});
</script>

<div
	class="volume-control"
	role="group"
	aria-label="Sound"
	onmouseenter={handleWrapperEnter}
	onmouseleave={handleWrapperLeave}
>
	<button
		type="button"
		class="volume-control__trigger"
		use:sound
		onclick={handleToggle}
		onkeydown={handleKeyDown}
		aria-label="Sound"
		title={$soundEnabledStore ? 'Mute' : 'Unmute'}
	>
		<!-- Sound on icon -->
		<svg class="sound-icon" class:visible={$soundEnabledStore} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path fill-rule="evenodd" clip-rule="evenodd" d="M10.4 1.8C11.5532 0.262376 14 1.07799 14 3.00001V21.1214C14 23.0539 11.5313 23.8627 10.3878 22.3049L6.49356 17H4C2.34315 17 1 15.6569 1 14V10C1 8.34315 2.34315 7 4 7H6.5L10.4 1.8ZM12 3L8.1 8.2C7.72229 8.70361 7.12951 9 6.5 9H4C3.44772 9 3 9.44772 3 10V14C3 14.5523 3.44772 15 4 15H6.49356C7.13031 15 7.72901 15.3032 8.10581 15.8165L12 21.1214V3Z" fill="currentColor" />
			<path d="M16.2137 4.17445C16.1094 3.56451 16.5773 3 17.1961 3C17.6635 3 18.0648 3.328 18.1464 3.78824C18.4242 5.35347 19 8.96465 19 12C19 15.0353 18.4242 18.6465 18.1464 20.2118C18.0648 20.672 17.6635 21 17.1961 21C16.5773 21 16.1094 20.4355 16.2137 19.8256C16.5074 18.1073 17 14.8074 17 12C17 9.19264 16.5074 5.8927 16.2137 4.17445Z" fill="currentColor" />
			<path d="M21.41 5C20.7346 5 20.2402 5.69397 20.3966 6.35098C20.6758 7.52413 21 9.4379 21 12C21 14.5621 20.6758 16.4759 20.3966 17.649C20.2402 18.306 20.7346 19 21.41 19C21.7716 19 22.0974 18.7944 22.2101 18.4509C22.5034 17.5569 23 15.5233 23 12C23 8.47672 22.5034 6.44306 22.2101 5.54913C22.0974 5.20556 21.7716 5 21.41 5Z" fill="currentColor" />
		</svg>
		<!-- Sound off icon -->
		<svg class="sound-icon" class:visible={!$soundEnabledStore} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path fill-rule="evenodd" clip-rule="evenodd" d="M14 3.00001C14 1.07799 11.5532 0.262376 10.4 1.8L6.5 7H4C2.34315 7 1 8.34315 1 10V14C1 15.6569 2.34315 17 4 17H6.49356L10.3878 22.3049C11.5313 23.8627 14 23.0539 14 21.1214V3.00001ZM8.1 8.2L12 3V21.1214L8.10581 15.8165C7.72901 15.3032 7.13031 15 6.49356 15H4C3.44772 15 3 14.5523 3 14V10C3 9.44772 3.44772 9 4 9H6.5C7.12951 9 7.72229 8.70361 8.1 8.2Z" fill="currentColor" />
			<path d="M21.2929 8.57094C21.6834 8.18041 22.3166 8.18042 22.7071 8.57094C23.0976 8.96146 23.0976 9.59463 22.7071 9.98515L20.7603 11.9319L22.7071 13.8787C23.0976 14.2692 23.0976 14.9024 22.7071 15.2929C22.3166 15.6834 21.6834 15.6834 21.2929 15.2929L19.3461 13.3461L17.3994 15.2929C17.0088 15.6834 16.3757 15.6834 15.9852 15.2929C15.5946 14.9023 15.5946 14.2692 15.9852 13.8787L17.9319 11.9319L15.9852 9.98517C15.5946 9.59464 15.5946 8.96148 15.9852 8.57096C16.3757 8.18043 17.0088 8.18043 17.3994 8.57096L19.3461 10.5177L21.2929 8.57094Z" fill="currentColor" />
		</svg>
	</button>

	{#if open}
		<div
			class="volume-control__tooltip"
			bind:this={tooltipEl}
			onmouseenter={handleTooltipEnter}
			onmouseleave={handleTooltipLeave}
			role="presentation"
		>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				bind:value={volumeLevel}
				oninput={handleInput}
				aria-label="Volume"
			/>
		</div>
	{/if}
</div>

<style lang="scss">
	.volume-control {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 24px;
	}

	.volume-control__trigger {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		padding: 0;
		background: none;
		border: none;
		color: var(--color--text);
		cursor: pointer;
		transition: color 0.2s ease;

		&:hover {
			color: var(--color--primary);
		}

		&:focus-visible {
			outline: 2px solid var(--color--primary);
			outline-offset: 2px;
		}
	}

	.sound-icon {
		width: 20px;
		height: 20px;
		position: absolute;
		display: none;

		&.visible {
			display: block;
			position: static;
		}
	}

	.volume-control__tooltip {
		display: flex;
		align-items: center;	
		position: absolute;
		top: 90%;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1001;
		margin-top: 6px;
		padding: 8px;
		background: var(--color--card-background);
		border-radius: 12px;
		white-space: nowrap;
		animation: volIn 0.2s ease-out;

		@media screen and (prefers-reduced-motion: reduce) {
			animation: none;
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}

		input[type='range'] {
			width: 100px;
			height: 6px;
			appearance: none;
			background: var(--color--code-inline-background);
			border-radius: 999px;
			outline: none;
			cursor: pointer;

			&::-webkit-slider-thumb {
				appearance: none;
				width: 14px;
				height: 14px;
				background: var(--color--primary);
				border-radius: 50%;
				cursor: pointer;
				transition: transform 0.15s ease;
			}
			&::-webkit-slider-thumb:hover {
				transform: scale(1.15);
			}
			&::-moz-range-thumb {
				width: 14px;
				height: 14px;
				background: var(--color--primary);
				border: none;
				border-radius: 50%;
				cursor: pointer;
				transition: transform 0.15s ease;
			}
			&::-moz-range-thumb:hover {
				transform: scale(1.15);
			}
		}
	}

	@keyframes volIn {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}
</style>
