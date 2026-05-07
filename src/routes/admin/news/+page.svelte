<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { sound } from '$lib/utils/sound';
	import { parseVideoCoverUrl, youtubeThumbUrl } from '$lib/utils/embedVideoLinks';
	import type { NewsRow } from '$lib/data/news-posts/fromSupabase';

	interface Props {
		data: {
			admin: { id: string; login: string };
			items: NewsRow[];
			error?: string;
		};
		form?: {
			createError?: string;
			createSuccess?: boolean;
			updateError?: string;
			updateSuccess?: boolean;
			deleteError?: string;
			deleteSuccess?: boolean;
		};
	}

	let { data, form }: Props = $props();

	const items = $derived(data?.items ?? []);
	let editingSlug = $state<string | null>(null);
	let editSlug = $state('');
	let editTitle = $state('');
	let editDate = $state('');
	let editUpdated = $state('');
	let editExcerpt = $state('');
	let editBody = $state('');
	let editCoverImage = $state('');
	let editTags = $state('');
	let editHidden = $state(false);

	// Cover upload UI — Add new form
	let newCoverInputRef = $state<HTMLInputElement | null>(null);
	let newCoverPreviewUrl = $state<string | null>(null);
	let newCoverFileName = $state('');
	let newDropActive = $state(false);

	// Cover upload UI — Edit form
	let editCoverInputRef = $state<HTMLInputElement | null>(null);
	let editCoverPreviewUrl = $state<string | null>(null);
	let editCoverFileName = $state('');
	let editDropActive = $state(false);

	function toDateInput(iso: string): string {
		if (!iso) return '';
		const d = new Date(iso);
		return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
	}

	function setInputFileFromDrop(input: HTMLInputElement | null, file: File): void {
		if (!input) return;
		const dt = new DataTransfer();
		dt.items.add(file);
		input.files = dt.files;
		input.dispatchEvent(new Event('change', { bubbles: true }));
	}

	function handleNewCoverChange(e: Event): void {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (newCoverPreviewUrl) URL.revokeObjectURL(newCoverPreviewUrl);
		if (file && file.type.startsWith('image/')) {
			newCoverPreviewUrl = URL.createObjectURL(file);
			newCoverFileName = file.name;
		} else {
			newCoverPreviewUrl = null;
			newCoverFileName = '';
		}
	}

	function removeNewCover(): void {
		if (newCoverPreviewUrl) URL.revokeObjectURL(newCoverPreviewUrl);
		newCoverPreviewUrl = null;
		newCoverFileName = '';
		if (newCoverInputRef) {
			const dt = new DataTransfer();
			newCoverInputRef.files = dt.files;
		}
	}

	function handleEditCoverChange(e: Event): void {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (editCoverPreviewUrl) URL.revokeObjectURL(editCoverPreviewUrl);
		if (file && file.type.startsWith('image/')) {
			editCoverPreviewUrl = URL.createObjectURL(file);
			editCoverFileName = file.name;
		} else {
			editCoverPreviewUrl = null;
			editCoverFileName = '';
		}
	}

	function removeEditCover(): void {
		if (editCoverPreviewUrl) URL.revokeObjectURL(editCoverPreviewUrl);
		editCoverPreviewUrl = null;
		editCoverFileName = '';
		editCoverImage = '';
		if (editCoverInputRef) {
			const dt = new DataTransfer();
			editCoverInputRef.files = dt.files;
		}
	}

	function startEdit(item: NewsRow) {
		editingSlug = item.slug;
		editSlug = item.slug;
		editTitle = item.title;
		editDate = toDateInput(item.date);
		editUpdated = item.updated ? toDateInput(item.updated) : '';
		editExcerpt = item.excerpt;
		editBody = item.body;
		editCoverImage = item.cover_image ?? '';
		editTags = (item.tags ?? []).join(', ');
		editHidden = item.hidden;
		if (editCoverPreviewUrl) URL.revokeObjectURL(editCoverPreviewUrl);
		editCoverPreviewUrl = null;
		editCoverFileName = '';
	}

	/** Auto-resize textarea by content; optional min/max height in px */
	function autoResize(
		el: HTMLTextAreaElement,
		opts?: { minHeight?: number; maxHeight?: number }
	) {
		const minH = opts?.minHeight ?? 52;
		const maxH = opts?.maxHeight ?? 720;
		function resize() {
			el.style.height = 'auto';
			const scrollH = el.scrollHeight;
			const h = Math.min(Math.max(scrollH, minH), maxH);
			el.style.height = `${h}px`;
			el.style.overflowY = scrollH > maxH ? 'auto' : 'hidden';
		}
		el.addEventListener('input', resize);
		resize();
		requestAnimationFrame(resize);
		const t = setTimeout(resize, 120);
		return {
			destroy() {
				clearTimeout(t);
				el.removeEventListener('input', resize);
			}
		};
	}
</script>

<svelte:head>
	<title>News — Admin</title>
</svelte:head>

<div class="page-header">
	<h1>News</h1>
	<p class="sub">Edit news posts. Changes appear on <a href="/news" target="_blank" rel="noopener">/news</a>. Body is Markdown.</p>
	<a href="/admin" class="back-link" use:sound>← Dashboard</a>
</div>

{#if data?.error}
	<p class="msg error">Load error: {data.error}</p>
{/if}
{#if form?.createSuccess}
	<p class="msg success">Post added.</p>
{/if}
{#if form?.createError}
	<p class="msg error">{form.createError}</p>
{/if}
{#if form?.updateSuccess}
	<p class="msg success">Post updated.</p>
{/if}
{#if form?.updateError}
	<p class="msg error">{form.updateError}</p>
{/if}
{#if form?.deleteSuccess}
	<p class="msg success">Post deleted.</p>
{/if}
{#if form?.deleteError}
	<p class="msg error">{form.deleteError}</p>
{/if}

<section class="section">
	<h2>Add new</h2>
	<form method="POST" action="?/create" class="form" enctype="multipart/form-data" use:enhance>
		<div class="row">
			<label for="new-slug">Slug (URL path, e.g. my-post)</label>
			<input id="new-slug" name="slug" type="text" required placeholder="my-post" />
		</div>
		<div class="row">
			<label for="new-title">Title</label>
			<input id="new-title" name="title" type="text" required />
		</div>
		<div class="row row-inline">
			<div>
				<label for="new-date">Date</label>
				<input id="new-date" name="date" type="datetime-local" />
			</div>
			<div>
				<label for="new-updated">Updated <span class="italic"> | Leave empty to use current time on save</span></label>
				
				<input id="new-updated" name="updated" type="datetime-local" />
			</div>
		</div>
		<div class="row">
			<label for="new-excerpt">Excerpt</label>
			<textarea id="new-excerpt" name="excerpt" class="textarea-auto" rows="2" use:autoResize={{ minHeight: 52, maxHeight: 320 }}></textarea>
		</div>
		<div class="row">
			<label for="new-body">Body (Markdown)</label>
			<textarea id="new-body" name="body" class="textarea-auto body-textarea" rows="10" use:autoResize={{ minHeight: 120, maxHeight: 720 }}></textarea>
		</div>
		<div class="row">
			<label for="new-cover">Cover image</label>
			<p class="hint">Upload a file or paste URL below. Upload is saved to Supabase Storage.</p>
			<div class="file-upload">
				<button class="file-upload-btn" type="button" use:sound onclick={() => newCoverInputRef?.click()}>Add Image</button>
				<div
					class="image-upload-wrap"
					class:image-dropping={newDropActive}
					ondragover={(e) => { e.preventDefault(); newDropActive = true; }}
					ondragleave={() => { newDropActive = false; }}
					ondrop={(e) => {
						e.preventDefault();
						newDropActive = false;
						const file = e.dataTransfer?.files?.[0];
						if (file?.type.startsWith('image/')) setInputFileFromDrop(newCoverInputRef, file);
					}}
				>
					<input
						class="file-upload-input"
						id="new-cover-file"
						name="cover_file"
						type="file"
						accept="image/*"
						bind:this={newCoverInputRef}
						onchange={handleNewCoverChange}
					/>
					<div class="drag-text">
						<h3>Drag and drop a file or select Add Image</h3>
					</div>
				</div>
				<div class="file-upload-content" class:show={!!newCoverPreviewUrl}>
					<img class="file-upload-image" src={newCoverPreviewUrl ?? ''} alt="Preview" />
					<div class="image-title-wrap">
						<button type="button" class="remove-image" use:sound onclick={() => removeNewCover()}>
							Remove <span class="image-title">{newCoverFileName || 'Image'}</span>
						</button>
					</div>
				</div>
			</div>
			<input id="new-cover" name="cover_image" type="text" placeholder="Or paste URL: /images/posts/cover.jpg" class="cover-url-input" />
		</div>
		<div class="row">
			<label for="new-tags">Tags (comma-separated)</label>
			<input id="new-tags" name="tags" type="text" placeholder="PZS, News" />
		</div>
		<div class="row row-check">
			<label><input type="checkbox" name="hidden" value="on" /> Hidden</label>
		</div>
		<button type="submit" class="btn primary" use:sound>Add post</button>
	</form>
</section>

<section class="section">
	<h2>Posts ({items.length})</h2>
	<ul class="list">
		{#each items as item (item.slug)}
			<li class="item">
				{#if editingSlug === item.slug}
					<form
						method="POST"
						action="?/update"
						class="form compact"
						enctype="multipart/form-data"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success' && result.data?.updateSuccess) {
									editingSlug = null;
									await invalidateAll();
								}
							};
						}}
					>
						<input type="hidden" name="slug" value={editSlug} />
						<div class="row">
							<label for="edit-title-{item.slug}">Title</label>
							<input id="edit-title-{item.slug}" name="title" type="text" bind:value={editTitle} required />
						</div>
						<div class="row row-inline">
							<div>
								<label for="edit-date-{item.slug}">Date</label>
								<input id="edit-date-{item.slug}" name="date" type="datetime-local" bind:value={editDate} />
							</div>
							<div>
								<label for="edit-updated-{item.slug}">Updated <span class="italic"> | Set to current time when you save</span></label>
								<input id="edit-updated-{item.slug}" name="updated" type="datetime-local" bind:value={editUpdated} disabled title="Set automatically on save" />
							</div>
						</div>
						<div class="row">
							<label for="edit-excerpt-{item.slug}">Excerpt</label>
							<textarea id="edit-excerpt-{item.slug}" name="excerpt" class="textarea-auto" rows="2" bind:value={editExcerpt} use:autoResize={{ minHeight: 52, maxHeight: 320 }}></textarea>
						</div>
						<div class="row">
							<label for="edit-body-{item.slug}">Body (Markdown)</label>
							<textarea id="edit-body-{item.slug}" name="body" class="textarea-auto body-textarea" rows="8" bind:value={editBody} use:autoResize={{ minHeight: 120, maxHeight: 720 }}></textarea>
						</div>
						<div class="row">
							<label for="edit-cover-{item.slug}">Cover image</label>
							<div class="file-upload">
								<button class="file-upload-btn" type="button" use:sound onclick={() => editCoverInputRef?.click()}>Add Image</button>
								<div
									class="image-upload-wrap"
									class:image-dropping={editDropActive}
									ondragover={(e) => { e.preventDefault(); editDropActive = true; }}
									ondragleave={() => { editDropActive = false; }}
									ondrop={(e) => {
										e.preventDefault();
										editDropActive = false;
										const file = e.dataTransfer?.files?.[0];
										if (file?.type.startsWith('image/')) setInputFileFromDrop(editCoverInputRef, file);
									}}
								>
									<input
										class="file-upload-input"
										id="edit-cover-file-{item.slug}"
										name="cover_file"
										type="file"
										accept="image/*"
										bind:this={editCoverInputRef}
										onchange={handleEditCoverChange}
									/>
									<div class="drag-text">
										<h3>Drag and drop a file or select Add Image</h3>
									</div>
								</div>
								<div class="file-upload-content" class:show={!!editCoverPreviewUrl || !!editCoverImage}>
									{#if editCoverPreviewUrl}
										<img class="file-upload-image" src={editCoverPreviewUrl} alt="Preview" />
									{:else if editCoverImage}
										{@const coverVideo = parseVideoCoverUrl(editCoverImage)}
										{#if coverVideo?.type === 'youtube'}
											<img class="file-upload-image" src={youtubeThumbUrl(coverVideo.videoId)} alt="YouTube cover" />
										{:else if coverVideo?.type === 'tiktok'}
											<div class="cover-video-placeholder">
												<span>TikTok video</span>
												<small>{editCoverImage}</small>
											</div>
										{:else}
											<img class="file-upload-image" src={editCoverImage} alt="Current cover" />
										{/if}
									{/if}
									<div class="image-title-wrap">
										<button type="button" class="remove-image" use:sound onclick={() => removeEditCover()}>
											Remove <span class="image-title">{editCoverFileName || editCoverImage || 'Image'}</span>
										</button>
									</div>
								</div>
							</div>
							<input id="edit-cover-{item.slug}" name="cover_image" type="text" bind:value={editCoverImage} placeholder="Or paste URL" class="cover-url-input" />
						</div>
						<div class="row">
							<label for="edit-tags-{item.slug}">Tags (comma-separated)</label>
							<input id="edit-tags-{item.slug}" name="tags" type="text" bind:value={editTags} />
						</div>
						<div class="row row-check">
							<label><input type="checkbox" name="hidden" value="on" bind:checked={editHidden} /> Hidden</label>
						</div>
						<div class="row actions">
							<button type="submit" class="btn primary" use:sound>Save</button>
							<button type="button" class="btn" onclick={() => (editingSlug = null)} use:sound>Cancel</button>
						</div>
					</form>
				{:else}
					<div class="item-preview">
						<span class="item-slug">{item.slug}</span>
						{#if item.hidden}
							<span class="item-badge hidden">Hidden</span>
						{/if}
						<span class="item-title">{item.title}</span>
						<span class="item-date">{new Date(item.date).toLocaleDateString()}</span>
						<div class="item-actions">
							<button type="button" class="btn small" onclick={() => startEdit(item)} use:sound>Edit</button>
							<form method="POST" action="?/delete" style="display:inline" use:enhance onsubmit={(e) => { if (!confirm('Delete this post?')) e.preventDefault(); }}>
								<input type="hidden" name="slug" value={item.slug} />
								<button type="submit" class="btn small danger" use:sound>Delete</button>
							</form>
						</div>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
	{#if items.length === 0}
		<p class="empty">No posts. Add one above.</p>
	{/if}
</section>

<style>
	.cover-video-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--color--team-card-avatar-bg, #2a2a2a);
		color: var(--color--text-shade);
		font-size: 0.9rem;
		min-height: 120px;
	}
	.cover-video-placeholder small {
		font-size: 0.7rem;
		opacity: 0.8;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
