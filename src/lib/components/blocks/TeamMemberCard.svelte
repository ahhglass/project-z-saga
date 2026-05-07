<script lang="ts">
	import {
		Telegram as TelegramIcon,
		GitHub as GitHubIcon,
		X as XIcon,
		Discord as DiscordIcon,
		Email as EmailIcon,
		LinkedIn as LinkedInIcon,
		Youtube as YoutubeIcon,
		Tiktok as TiktokIcon,
		Curseforge as CurseforgeIcon,
		Rss as RssIcon,
		Mastodon as MastodonIcon,
		Link as LinkIcon
	} from '$lib/icons';
	import type { TeamMember } from '$lib/data/team';
	import { sound, soundManager, isTouchDevice } from '$lib/utils/sound';

	interface Props {
		member: TeamMember;
	}

	let { member }: Props = $props();

	const initials = $derived(
		member.name
			.split(/\s+/)
			.map((w) => w[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	);

</script>

<article
	class="team-card"
	onmouseenter={() => {
		if (!isTouchDevice()) soundManager.playSound('cardHover');
	}}
>

	{#if member.avatar}
		<div
			class="image-layer"
			style="--avatar-url: url('{member.avatar}')"
			role="img"
			aria-label="{member.name}"
		></div>
	{:else}
		<div class="avatar-placeholder" aria-hidden="true">{initials}</div>
	{/if}

	<div class="top-overlay">
		<h3 class="name">{member.name}</h3>
		{#if member.socials?.length}
			<div class="icons">
				{#each member.socials as social}
					<a
						href={social.url}
						target="_blank"
						rel="noopener noreferrer"
						class="icon-link"
						title={social.label ?? social.type}
						use:sound
					>
						{#if social.type === 'telegram'}
							<TelegramIcon />
						{:else if social.type === 'github'}
							<GitHubIcon />
						{:else if social.type === 'x'}
							<XIcon />
						{:else if social.type === 'discord'}
							<DiscordIcon />
						{:else if social.type === 'email'}
							<EmailIcon />
						{:else if social.type === 'linkedin'}
							<LinkedInIcon />
						{:else if social.type === 'youtube'}
							<YoutubeIcon />
						{:else if social.type === 'tiktok'}
							<TiktokIcon />
						{:else if social.type === 'curseforge'}
							<CurseforgeIcon />
						{:else if social.type === 'rss'}
							<RssIcon />
						{:else if social.type === 'mastodon'}
							<MastodonIcon />
						{:else}
							<LinkIcon />
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	</div>

	<div class="bottom-panel">
		<p class="role">{member.role}</p>
		{#if member.description}
			<p class="description">{member.description}</p>
		{/if}
		{#if member.tags?.length}
			<div class="tags" role="list">
				{#each member.tags as tag}
					<span class="badge" role="listitem">{tag}</span>
				{/each}
			</div>
		{/if}
	</div>
</article>

<style lang="scss">
	@use '$lib/scss/breakpoints' as *;

	.team-card {
		--card-w: 300px;
		--card-h: 379px;
		height: var(--card-h);
		width: 100%;
		max-width: var(--card-w);
		min-width: 200px;
		background: var(--color--team-card-avatar-bg);
		border-radius: 10px;
		overflow: hidden;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: box-shadow 0.3s ease;

		&:hover {
			box-shadow: 0 70px 63px -60px rgba(0, 0, 0, 0.6);
		}

		@include for-phone-only {
			--card-w: 100%;
			--card-h: 200px;
			min-width: 0;
			max-width: 100%;
		}
	}

	.border {
		position: absolute;
		inset: 0;
		border-radius: 10px;
		background: transparent;
		border: 1px solid transparent;
		transition: border 0.6s ease;
		pointer-events: none;
		z-index: 2;
	}

	.team-card:hover .border {
		border-color: var(--color--primary);
	}

	.image-layer {
		position: absolute;
		inset: 0;
		background: var(--avatar-url) center center no-repeat;
		background-size: var(--card-w);
		transition: background-size 0.8s ease, background-position 0.8s ease;
	}

	.team-card:hover .image-layer {
		background-position: -32px center;
		background-size: 512px;

		@include for-phone-only {
			background-position: center;
			background-size: 256px;
		}
	}

	.avatar-placeholder {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color--text-shade);
		background: var(--color--team-card-avatar-bg);
	}

	.top-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50%;
		min-height: 120px;
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: space-between;
		padding: 20px;
		pointer-events: none;
		z-index: 2;

		@include for-phone-only {
			padding: 10px;
			min-height: 70px;
		}
	}

	.top-overlay .icon-link {
		pointer-events: auto;
	}

	.name {
		font-family: var(--font--title);
		color: var(--color--text-inverse);
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		opacity: 0;
		transition: opacity 0.6s ease;

		@include for-phone-only {
			font-size: 0.9rem;
		}
	}

	.team-card:hover .name {
		opacity: 1;
	}

	.icons {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 4px;

		@include for-phone-only {
			gap: 3px;
		}
	}

	.icon-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		color: var(--color--text-inverse);
		fill: var(--color--text-inverse);
		opacity: 0;
		transition: opacity 0.6s ease, color 0.2s ease;

		:global(svg) {
			width: 18px;
			height: 18px;
			margin-top: 5px;
		}

		@include for-phone-only {
			width: 22px;
			height: 22px;

			:global(svg) {
				width: 16px;
				height: 16px;
			}
		}
	}

	.team-card:hover .icon-link {
		opacity: 1;
		
	}

	.icon-link:hover {
		color: var(--color--primary);
		fill: var(--color--primary);
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.7));

	}

	.bottom-panel {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 16px 14px;
		background: linear-gradient(
			to top,
			var(--color--team-card-panel-from) 0%,
			var(--color--team-card-panel-to) 70%,
			transparent 100%
		);
		color: var(--color--text-inverse);
		transform: translateY(100%);
		opacity: 0;
		transition: transform 0.4s ease, opacity 0.4s ease;
		z-index: 1;
		pointer-events: none;

		@include for-phone-only {
			padding: 8px 10px;
		}
	}

	.team-card:hover .bottom-panel {
		transform: translateY(0);
		opacity: 1;
		pointer-events: auto;
	}

	.bottom-panel .role {
		margin: 0 0 6px;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color--primary-shade);

		@include for-phone-only {
			font-size: 0.65rem;
			margin-bottom: 2px;
		}
	}

	.bottom-panel .description {
		margin: 0 0 8px;
		font-size: 0.75rem;
		color: var(--color--team-card-text);
		line-height: 1.35;
		font-style: italic;

		@include for-phone-only {
			font-size: 0.6rem;
			margin-bottom: 4px;
		}
	}

	.bottom-panel .tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 0;
	}

	.bottom-panel .badge {
		display: inline-flex;
		align-items: center;
		padding: 3px 8px;
		border-radius: 6px;
		font-size: 0.65rem;
		font-weight: 500;
		white-space: nowrap;
		background: var(--color--team-card-panel-badge-bg);
		color: var(--color--text-inverse);

		@include for-phone-only {
			padding: 2px 5px;
			font-size: 0.55rem;
		}
	}
</style>
