<script lang="ts">
	import { enhance } from '$app/forms';
	import { sound } from '$lib/utils/sound';
	import type { SiteSettings } from '../../+layout.server';
	import {
		parseSocialLinksAll,
		SOCIAL_ICON_KEYS,
		type SocialLinkItem,
		type SocialIconKey
	} from '$lib/utils/types';

	interface Props {
		data: {
			admin: { id: string; login: string };
			settings: SiteSettings | null;
		};
		form?: { saveSuccess?: boolean; saveError?: string };
	}

	let { data, form }: Props = $props();

	const s = $derived(data?.settings);
	const site_base_url = $derived(s?.site_base_url ?? '');
	const site_title = $derived(s?.site_title ?? '');
	const site_description = $derived(s?.site_description ?? '');
	const site_keywords = $derived(s?.site_keywords ?? '[]');
	const site_image = $derived(s?.site_image ?? '');
	const server_ip = $derived(s?.server_ip ?? '');
	const hero_title = $derived(s?.hero_title ?? '');
	const hero_subtitle = $derived(s?.hero_subtitle ?? '');
	const about_heading = $derived(s?.about_heading ?? '');
	const about_text = $derived(s?.about_text ?? '');
	const about_image = $derived(s?.about_image ?? '');
	const about_highlight = $derived(s?.about_highlight ?? '');
	const footer_team_label = $derived(s?.footer_team_label ?? '');
	const footer_team_url = $derived(s?.footer_team_url ?? '');
	const footer_slogan = $derived(s?.footer_slogan ?? '');
	const footer_disclaimer = $derived(s?.footer_disclaimer ?? '');

	let socialItems = $state<SocialLinkItem[]>([]);
	let socialInited = $state(false);
	$effect(() => {
		if (socialInited || !data?.settings) return;
		socialInited = true;
		socialItems = parseSocialLinksAll(data.settings.social_links);
	});

	function addSocialLink() {
		socialItems = [...socialItems, { label: '', url: '', icon: 'link' }];
	}
	function removeSocialLink(i: number) {
		socialItems = socialItems.filter((_, idx) => idx !== i);
	}
	function setSocialItem<K extends keyof SocialLinkItem>(i: number, key: K, value: SocialLinkItem[K]) {
		socialItems = socialItems.map((item, idx) =>
			idx === i ? { ...item, [key]: value } : item
		);
	}

	/** On success: do not reset form or invalidate — keeps inputs filled */
	function handleEnhance() {
		return async ({
			update
		}: {
			update: (opts?: { reset?: boolean; invalidateAll?: boolean }) => Promise<void>;
		}) => {
			await update({ reset: false, invalidateAll: false });
		};
	}
</script>

<svelte:head>
	<title>Settings — Admin</title>
</svelte:head>

<div class="page-header">
	<h1>Settings</h1>
	<p class="sub">Site meta, hero text, server IP. Used on the main site when set.</p>
	<a href="/admin" class="back-link" use:sound>← Dashboard</a>
</div>

{#if form?.saveSuccess}
	<p class="msg success">Settings saved.</p>
{/if}
{#if form?.saveError}
	<p class="msg error">{form.saveError}</p>
{/if}

<section class="section">
	<form method="POST" action="?/save" class="form" use:enhance={handleEnhance}>
	<section class="block">
		<h2>Meta</h2>
		<div class="row">
			<label for="site_base_url">Site base URL</label>
			<input id="site_base_url" name="site_base_url" type="url" value={site_base_url} />
		</div>
		<div class="row">
			<label for="site_title">Site title (e.g. Project Z Saga)</label>
			<input id="site_title" name="site_title" type="text" value={site_title} />
		</div>
		<div class="row">
			<label for="site_description">Meta description</label>
			<textarea id="site_description" name="site_description" rows="2">{site_description}</textarea>
		</div>
		<div class="row">
			<label for="site_keywords">Keywords (JSON array)</label>
			<textarea id="site_keywords" name="site_keywords" rows="2">{site_keywords}</textarea>
		</div>
		<div class="row">
			<label for="site_image">Default og:image URL</label>
			<input id="site_image" name="site_image" type="text" value={site_image} placeholder="https://... or /images/site-preview.png" />
		</div>
	</section>
	<section class="block">
		<h2>Server</h2>
		<div class="row">
			<label for="server_ip">Server IP (Play Now modal)</label>
			<input id="server_ip" name="server_ip" type="text" value={server_ip} placeholder="76.164.196.197:25565" />
		</div>
	</section>
	<section class="block">
		<h2>Hero (home page)</h2>
		<div class="row">
			<label for="hero_title">Hero title</label>
			<input id="hero_title" name="hero_title" type="text" value={hero_title} />
		</div>
		<div class="row">
			<label for="hero_subtitle">Hero subtitle</label>
			<input id="hero_subtitle" name="hero_subtitle" type="text" value={hero_subtitle} />
		</div>
	</section>
	<section class="block">
		<h2>About (home page block)</h2>
		<div class="row">
			<label for="about_heading">About heading</label>
			<input id="about_heading" name="about_heading" type="text" value={about_heading} placeholder="e.g. Project Z Saga — Dragon Ball Minecraft MMORPG" />
		</div>
		<div class="row">
			<label for="about_highlight">Highlight phrase (word to sparkle)</label>
			<input id="about_highlight" name="about_highlight" type="text" value={about_highlight} placeholder="e.g. Soul Reaper — must match heading text" />
		</div>
		<div class="row">
			<label for="about_text">About text</label>
			<textarea id="about_text" name="about_text" rows="3" placeholder="Short description for the about section">{about_text}</textarea>
		</div>
		<div class="row">
			<label for="about_image">About image URL</label>
			<input id="about_image" name="about_image" type="text" value={about_image} placeholder="/images/sample-image.webp or https://..." />
		</div>
	</section>
	<section class="block block-footer">
		<h2>Footer (copyright)</h2>
		<p class="hint">Copyright: © year + team link, then slogan (second line), then disclaimer.</p>
		<div class="row row-inline">
			<div>
				<label for="footer_team_label">Team label</label>
				<input id="footer_team_label" name="footer_team_label" type="text" value={footer_team_label} placeholder="PZS Team" />
			</div>
			<div>
				<label for="footer_team_url">Team URL</label>
				<input id="footer_team_url" name="footer_team_url" type="url" value={footer_team_url} placeholder="https://discord.gg/..." />
			</div>
		</div>
		<div class="row">
			<label for="footer_slogan">Copyright line 2 (slogan)</label>
			<input id="footer_slogan" name="footer_slogan" type="text" value={footer_slogan} placeholder="Fan-made site. Not affiliated with rights holders." />
		</div>
		<div class="row">
			<label for="footer_disclaimer">Disclaimer (legal)</label>
			<textarea id="footer_disclaimer" name="footer_disclaimer" rows="2" placeholder="Dragon Ball © ... Minecraft © Mojang. Fan project.">{footer_disclaimer}</textarea>
		</div>
	</section>
	<section class="block block-social">
		<h2>Social links</h2>
		<p class="hint">Add any links; pick an icon. Empty URL = not shown on site.</p>
		<input type="hidden" name="social_links" value={JSON.stringify(socialItems)} />
		<div class="social-list">
			{#each socialItems as item, i}
				<div class="social-row">
					<select
						class="social-icon-pick"
						aria-label="Icon"
						title="Icon"
						value={item.icon}
						onchange={(e) => setSocialItem(i, 'icon', (e.currentTarget.value as SocialIconKey))}
					>
						{#each SOCIAL_ICON_KEYS as key}
							<option value={key}>{key}</option>
						{/each}
					</select>
					<input
						type="text"
						class="social-label"
						placeholder="Label"
						aria-label="Label"
						value={item.label}
						oninput={(e) => setSocialItem(i, 'label', e.currentTarget.value)}
					/>
					<input
						type="url"
						class="social-url"
						placeholder="https://..."
						aria-label="URL"
						value={item.url}
						oninput={(e) => setSocialItem(i, 'url', e.currentTarget.value)}
					/>
					<button type="button" class="btn icon-btn" title="Remove" aria-label="Remove" use:sound onclick={() => removeSocialLink(i)}>×</button>
				</div>
			{/each}
		</div>
		<button type="button" class="btn secondary btn-add" use:sound onclick={addSocialLink}>+ Add link</button>
	</section>
	<button type="submit" class="btn primary" use:sound>Save settings</button>
	</form>
</section>
