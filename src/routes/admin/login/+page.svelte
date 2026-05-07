<script lang="ts">
	import { enhance } from '$app/forms';
	import { Eye as EyeIcon, EyeClose as EyeCloseIcon } from '$lib/icons';
	import { sound } from '$lib/utils/sound';

	interface Props {
		form?: { error?: string };
	}

	let { form }: Props = $props();
	let showPassword = $state(false);
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Admin login</title>
</svelte:head>

<div class="login-wrap">
	<div class="login-card">
		<h1>Admin</h1>
		<p class="hint">Log in to manage the site.</p>

		<form
			method="POST"
			action="?/login"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			{#if form?.error}
				<p class="error" role="alert">{form.error}</p>
			{/if}
			<div class="field">
				<label for="login">Login</label>
				<input id="login" name="login" type="text" autocomplete="username" required />
			</div>
			<div class="field">
				<label for="password">Password</label>
				<div class="password-wrap">
					<input
						id="password"
						name="password"
						type={showPassword ? 'text' : 'password'}
						autocomplete="current-password"
						required
					/>
					<button
						type="button"
						class="toggle-password"
						title={showPassword ? 'Hide password' : 'Show password'}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
						onclick={() => (showPassword = !showPassword)}
						use:sound
					>
						<span class="eye-icons" data-visible={showPassword}>
							<span class="eye-icon eye-open" aria-hidden="true">
								<EyeIcon />
							</span>
							<span class="eye-icon eye-close" aria-hidden="true">
								<EyeCloseIcon />
							</span>
						</span>
					</button>
				</div>
			</div>
			<button type="submit" class="submit" disabled={submitting} use:sound>
				<span class="btn-text" class:hidden={submitting}>Log in</span>
				<span class="btn-spinner" class:visible={submitting} aria-hidden="true">
					<span class="spinner"></span>
				</span>
			</button>
		</form>
	</div>
</div>

<style>
	.login-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: 1rem;
	}
	.login-card {
		width: 100%;
		max-width: 320px;
		padding: 1.5rem;
		background: var(--color--card-background);
		border-radius: 12px;
		box-shadow: var(--card-shadow);
		border: 1px solid var(--color--code-inline-background);
	}
	h1 {
		margin: 0 0 0.25rem;
		font-size: clamp(1.15rem, 1.1rem + 0.6vw, 1.25rem);
		color: var(--color--text);
	}
	.hint {
		margin: 0 0 1.25rem;
		font-size: clamp(0.7125rem, 0.78rem + 0.3vw, 0.875rem);
		color: var(--color--text-shade);
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.error {
		margin: 0;
		padding: 0.5rem 0.75rem;
		background: rgba(200, 60, 60, 0.15);
		color: var(--color--primary);
		border-radius: 8px;
		font-size: clamp(0.8125rem, 0.78rem + 0.25vw, 0.875rem);
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.field label {
		font-size: clamp(0.8125rem, 0.78rem + 0.25vw, 0.875rem);
		font-weight: 600;
		color: var(--color--text);
	}
	/* 1rem min prevents mobile browser zoom on focus (iOS zooms when input font-size < 16px) */
	.field input {
		padding: 0.5rem 0.75rem;
		font-size: clamp(1rem, 0.88rem + 0.35vw, 1.0625rem);
		border: 1px solid var(--color--code-inline-background);
		border-radius: 8px;
		background: var(--color--page-background);
		color: var(--color--text);
		font-family: inherit;
	}
	.password-wrap {
		display: flex;
		align-items: stretch;
		gap: 0;
		border: 1px solid var(--color--code-inline-background);
		border-radius: 8px;
		background: var(--color--page-background);
		overflow: hidden;
	}
	.password-wrap:focus-within {
		border-color: var(--color--primary);
		box-shadow: 0 0 0 2px rgba(var(--color--primary-rgb), 0.2);
	}
	.password-wrap input {
		flex: 1;
		min-width: 0;
		border: none;
		border-radius: 0;
	}
	.password-wrap input:focus {
		outline: none;
		box-shadow: none;
	}
	.toggle-password {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		min-width: 2.5rem;
		padding: 0;
		color: var(--color--text-shade);
		background: transparent;
		border: none;
		border-left: 1px solid var(--color--code-inline-background);
		cursor: pointer;
		transition: color 0.2s, background 0.2s, transform 0.2s ease;
	}
	.toggle-password:hover {
		color: var(--color--primary);
		background: rgba(var(--color--primary-rgb), 0.08);
	}
	.toggle-password:active {
		transform: scale(0.92);
	}
	.eye-icons {
		position: relative;
		display: block;
		width: 1.25rem;
		height: 1.25rem;
	}
	.eye-icon {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.35s cubic-bezier(0.25, 0, 0.2, 1), transform 0.35s cubic-bezier(0.25, 0, 0.2, 1);
	}
	.eye-icon :global(svg) {
		width: 100%;
		height: 100%;
	}
	.eye-open {
		opacity: 1;
		transform: scale(1);
	}
	.eye-close {
		opacity: 0;
		transform: scale(0.6);
		pointer-events: none;
	}
	.eye-icons[data-visible='true'] .eye-open {
		opacity: 0;
		transform: scale(0.6);
		pointer-events: none;
	}
	.eye-icons[data-visible='true'] .eye-close {
		opacity: 1;
		transform: scale(1);
		pointer-events: auto;
	}
	.submit {
		position: relative;
		margin-top: 0.25rem;
		padding: 0.6rem 1rem;
		min-height: 2.75rem;
		font-size: clamp(0.9375rem, 0.88rem + 0.35vw, 1rem);
		font-weight: 600;
		color: white;
		background: rgb(var(--color--primary-rgb));
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: filter 0.2s;
	}
	.submit:hover:not(:disabled) {
		filter: brightness(1.05);
	}
	.submit:active:not(:disabled) {
		filter: brightness(0.95);
	}
	.submit:disabled {
		cursor: wait;
	}
	.submit .btn-text,
	.submit .btn-spinner {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.25s ease;
	}
	.submit .btn-text.hidden {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
	.submit .btn-spinner {
		position: absolute;
		inset: 0;
		opacity: 0;
		pointer-events: none;
	}
	.submit .btn-spinner.visible {
		position: static;
		opacity: 1;
		pointer-events: none;
	}
	.spinner {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: login-spin 0.7s linear infinite;
	}

	@media screen and (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
			opacity: 0.8;
		}
	}

	@keyframes login-spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
