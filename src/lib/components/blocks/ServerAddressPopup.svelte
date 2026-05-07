<script lang="ts">
	import Button from '$ui/Button.svelte';
	import { Xmark } from '$lib/icons';
	import { sound } from '$lib/utils/sound';

	interface Props {
		serverIp?: string;
		onClose?: () => void;
	}

	let { serverIp = '76.164.196.197:25565', onClose }: Props = $props();

	let copied = $state(false);
	let copyTimeout: ReturnType<typeof setTimeout> | undefined;

	function copyAddress() {
		navigator.clipboard.writeText(serverIp).then(
			() => {
				copied = true;
				clearTimeout(copyTimeout);
				copyTimeout = setTimeout(() => {
					copied = false;
				}, 2000);
			},
			() => {
				const input = document.createElement('input');
				input.value = serverIp;
				document.body.appendChild(input);
				input.select();
				document.execCommand('copy');
				document.body.removeChild(input);
				copied = true;
				clearTimeout(copyTimeout);
				copyTimeout = setTimeout(() => (copied = false), 2000);
			}
		);
	}
</script>

<div class="server-popup mc-modal">
	<h2 class="title mc-modal-header">Server</h2>
	<div class="mc-modal-body">
	<p class="hint">Connect at the address:</p>
	<Button
		color="primary"
		style="understated"
		additionalClass="copy-btn"
		onclick={copyAddress}
	>
		{copied ? 'Copied!' : serverIp}
	</Button>
	</div>
	<button
		class="close-btn"
		type="button"
		aria-label="Close"
		onclick={onClose}
		use:sound
	>
		<span class="close-btn-icon" aria-hidden="true"><Xmark /></span>
	</button>
</div>

<style lang="scss">
	.server-popup {
		position: relative;
		padding: 0;
		min-width: 280px;
	}

	.title.mc-modal-header {
		margin: 0;
		padding: 16px;
		font-size: 1.25rem;
		text-align: center;
		color: #fff;
		font-family: 'MinecraftTen', sans-serif;
	}

	.mc-modal-body {
		padding: 16px;
	}

	.hint {
		margin: 0 0 12px;
		font-size: 1rem;
		text-align: center;
		color: var(--color--text-shade);
	}

	:global(.copy-btn) {
		width: 100%;
		font-family: var(--font--mono);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.close-btn {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 32px;
		height: 32px;
		padding: 0;
		border: none;
		background: transparent;
		color: var(--color--text-shade);
		cursor: pointer;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			color 0.35s var(--ease-4),
			background 0.35s var(--ease-4),
			transform 0.2s var(--ease-out-3);

		&:hover {
			color: var(--color--text);
			background: rgba(var(--color--primary-rgb), 0.1);
		}

		&:active {
			transform: scale(0.92);
		}

		.close-btn-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 1.25rem;
			height: 1.25rem;

			:global(svg) {
				width: 100%;
				height: 100%;
			}
		}
	}
</style>
