<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { sound } from '$lib/utils/sound';
	import type { WikiAdminRow } from './+page.server';

	interface WikiCatRow {
		id: string;
		title: string;
		description: string;
		sortOrder: number;
	}

	interface Props {
		data: {
			admin: { id: string; login: string };
			items: WikiAdminRow[];
			categories: WikiCatRow[];
			categoryDbIds: string[];
			loadError?: string;
		};
		form?: {
			createError?: string;
			createSuccess?: boolean;
			updateError?: string;
			updateSuccess?: boolean;
			deleteError?: string;
			deleteSuccess?: boolean;
			seedError?: string;
			seedSuccess?: boolean;
			seedCount?: number;
			categoryError?: string;
			categorySuccess?: 'created' | 'updated' | 'deleted';
		};
	}

	let { data, form }: Props = $props();

	const items = $derived(data?.items ?? []);
	const categories = $derived(data?.categories ?? []);
	const categoryDbIds = $derived(new Set(data?.categoryDbIds ?? []));

	let editingCategoryId = $state<string | null>(null);
	let editCatId = $state('');
	let editCatTitle = $state('');
	let editCatDescription = $state('');
	let editCatSort = $state(0);

	let editingId = $state<string | null>(null);
	let editSlug = $state('');
	let editTitle = $state('');
	let editCategoryId = $state('');
	let editBody = $state('');
	let editExcerpt = $state('');
	let editSortOrder = $state(0);
	let editHidden = $state(false);
	let editRowId = $state('');

	const categoryTitle = (id: string) => categories.find((c) => c.id === id)?.title ?? id;

	function startEdit(row: WikiAdminRow) {
		editingId = row.id;
		editRowId = row.id;
		editSlug = row.slug;
		editTitle = row.title;
		editCategoryId = row.category_id;
		editBody = row.body ?? '';
		editExcerpt = row.excerpt ?? '';
		editSortOrder = row.sort_order;
		editHidden = row.hidden;
	}

	function startEditCategory(cat: WikiCatRow) {
		editingCategoryId = cat.id;
		editCatId = cat.id;
		editCatTitle = cat.title;
		editCatDescription = cat.description ?? '';
		editCatSort = cat.sortOrder ?? 0;
	}

	const hasDbCategory = (id: string) => categoryDbIds.has(id);
</script>

<svelte:head>
	<title>Wiki — Admin</title>
</svelte:head>

<div class="page-header">
	<h1>Wiki</h1>
	<p class="sub">
		Markdown articles for <a href="/wiki" target="_blank" rel="noopener noreferrer" use:sound>/wiki</a>. Hidden entries do not appear to visitors.
	</p>
	<a href="/admin" class="back-link" use:sound>← Dashboard</a>
</div>

{#if data?.loadError}
	<pre class="msg error load-error">{data.loadError}</pre>
{/if}

{#if form?.createSuccess}
	<p class="msg success">Article created.</p>
{/if}
{#if form?.createError}
	<p class="msg error">{form.createError}</p>
{/if}
{#if form?.updateSuccess}
	<p class="msg success">Article saved.</p>
{/if}
{#if form?.updateError}
	<p class="msg error">{form.updateError}</p>
{/if}
{#if form?.deleteSuccess}
	<p class="msg success">Article deleted.</p>
{/if}
{#if form?.deleteError}
	<p class="msg error">{form.deleteError}</p>
{/if}
{#if form?.seedSuccess}
	<p class="msg success">
		Inserted {form.seedCount ?? '—'} starter page{form.seedCount === 1 ? '' : 's'}. Edit them below.
	</p>
{/if}
{#if form?.seedError}
	<p class="msg error">{form.seedError}</p>
{/if}
{#if form?.categorySuccess === 'created'}
	<p class="msg success">Category created.</p>
{/if}
{#if form?.categorySuccess === 'updated'}
	<p class="msg success">Category saved.</p>
{/if}
{#if form?.categorySuccess === 'deleted'}
	<p class="msg success">Category removed from database (built-ins fall back to code defaults).</p>
{/if}
{#if form?.categoryError}
	<p class="msg error">{form.categoryError}</p>
{/if}

<section class="section">
	<h2>Categories ({categories.length})</h2>
	<p class="sub section-hint">
		URL id becomes <code>/wiki/&lt;id&gt;/…</code>. Editing a built-in category saves an override row; delete removes only the DB row.
	</p>

	<form
		method="POST"
		action="?/categoryCreate"
		class="form cat-form"
		novalidate
		use:enhance={() => async ({ update, result, formElement }) => {
			await update({ reset: false, invalidateAll: false });
			if (result.type === 'success') {
				await invalidateAll();
				formElement.reset();
			}
		}}
	>
		<h3 class="h3">New category</h3>
		<div class="row row-inline">
			<div>
				<label for="nc-id">URL id</label>
				<input id="nc-id" name="cat_id" type="text" required maxlength="120" placeholder="e.g. economy" />
			</div>
			<div>
				<label for="nc-sort">Sort order</label>
				<input id="nc-sort" name="cat_sort_order" type="number" min="0" value="100" />
			</div>
		</div>
		<div class="row">
			<label for="nc-title">Title</label>
			<input id="nc-title" name="cat_title" type="text" required maxlength="200" />
		</div>
		<div class="row">
			<label for="nc-desc">Description</label>
			<input id="nc-desc" name="cat_description" type="text" maxlength="400" />
		</div>
		<button type="submit" class="btn primary" use:sound>Add category</button>
	</form>

	<ul class="list cat-list">
		{#each categories as cat (cat.id)}
			<li class="item">
				{#if editingCategoryId === cat.id}
					<form
						method="POST"
						action="?/categoryUpdate"
						class="form compact cat-form"
						novalidate
						use:enhance={() => async ({ update, result }) => {
							await update({ reset: false, invalidateAll: false });
							if (result.type === 'success') {
								editingCategoryId = null;
								await invalidateAll();
							}
						}}
					>
						<input type="hidden" name="cat_id" value={editCatId} />
						<div class="row row-inline">
							<div class="stretch">
								<label for="ec-title-{cat.id}">Title</label>
								<input id="ec-title-{cat.id}" name="cat_title" bind:value={editCatTitle} required maxlength="200" />
							</div>
							<div>
								<label for="ec-sort-{cat.id}">Sort</label>
								<input id="ec-sort-{cat.id}" name="cat_sort_order" type="number" bind:value={editCatSort} min="0" />
							</div>
						</div>
						<div class="row">
							<label for="ec-desc-{cat.id}">Description</label>
							<input id="ec-desc-{cat.id}" name="cat_description" bind:value={editCatDescription} maxlength="400" />
						</div>
						<p class="mono-id">id: <code>{editCatId}</code></p>
						<div class="row actions">
							<button type="submit" class="btn primary" use:sound>Save</button>
							<button type="button" class="btn" onclick={() => (editingCategoryId = null)} use:sound>Cancel</button>
						</div>
					</form>
				{:else}
					<div class="item-preview cat-row">
						<div class="cat-row__head">
							<code class="cat-id">{cat.id}</code>
							{#if hasDbCategory(cat.id)}
								<span class="badge-db">DB</span>
							{:else}
								<span class="badge-builtin">Built-in</span>
							{/if}
							<span class="cat-sort">sort {cat.sortOrder ?? 0}</span>
						</div>
						<span class="item-q">{cat.title}</span>
						<p class="cat-desc muted">{cat.description || '—'}</p>
						<div class="item-actions">
							<button type="button" class="btn small" onclick={() => startEditCategory(cat)} use:sound>Edit</button>
							<form
								method="POST"
								action="?/categoryDelete"
								style="display: inline"
								novalidate
								use:enhance={() => async ({ update, result }) => {
									await update({ reset: false, invalidateAll: false });
									if (result.type === 'success') await invalidateAll();
								}}
								onsubmit={(e) => {
									if (!hasDbCategory(cat.id)) {
										e.preventDefault();
										return;
									}
									if (!confirm(`Delete DB row for “${cat.id}”? Articles must be moved first.`)) e.preventDefault();
								}}
							>
								<input type="hidden" name="cat_id" value={cat.id} />
								<button type="submit" class="btn small danger" use:sound disabled={!hasDbCategory(cat.id)}
									>Delete</button
								>
							</form>
						</div>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<section class="section">
	<h2>New article</h2>
	<form
		method="POST"
		action="?/create"
		class="form"
		novalidate
		use:enhance={() => async ({ update, result, formElement }) => {
			await update({ reset: false, invalidateAll: false });
			if (result.type === 'success') {
				await invalidateAll();
				formElement.reset();
			}
		}}
	>
		<div class="row row-inline">
			<div>
				<label for="w-cat-new">Category</label>
						<select id="w-cat-new" name="category_id" required class="wide">
							<option value="" disabled>Select…</option>
					{#each categories as cat}
						<option value={cat.id}>{cat.title}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="w-sort-new">Sort order</label>
				<input id="w-sort-new" name="sort_order" type="number" min="0" value="0" />
			</div>
		</div>
		<div class="row row-inline">
			<div class="stretch">
				<label for="w-slug-new">URL slug</label>
				<input id="w-slug-new" name="slug" type="text" required placeholder="e.g. ki-basics" maxlength="160" />
			</div>
			<div class="stretch">
				<label for="w-title-new">Title</label>
				<input id="w-title-new" name="title" type="text" required maxlength="240" />
			</div>
		</div>
		<div class="row">
			<label for="w-exc-new">Short description (optional)</label>
			<input id="w-exc-new" name="excerpt" type="text" maxlength="320" placeholder="Shows in listings and SEO" />
		</div>
		<div class="row">
			<label class="chk">
				<input name="hidden" type="checkbox" />
				Hidden draft (not visible on /wiki)
			</label>
		</div>
		<div class="row">
			<label for="w-body-new">Body — Markdown</label>
			<textarea id="w-body-new" name="body" rows="14" spellcheck="false" placeholder="## Heading&#10;&#10;Text, lists, links…"></textarea>
		</div>
		<button type="submit" class="btn primary" use:sound>Add article</button>
	</form>
</section>

<section class="section">
	<h2>Articles ({items.length})</h2>

	{#if items.length === 0 && !data?.loadError}
		<div class="empty-wiki muted">
			<p>
				Base is empty — that is normal until you publish from here. Compose a page in <strong>New article</strong>,
				or use the button to drop in seven short “Overview” drafts (one per category).
			</p>
			<form
				method="POST"
				action="?/seedStarters"
				class="seed-form"
				novalidate
				use:enhance={() => async ({ update, result }) => {
					await update({ reset: false, invalidateAll: false });
					if (result.type === 'success') await invalidateAll();
				}}
			>
				<button type="submit" class="btn primary" use:sound>Insert starter pages (empty table only)</button>
			</form>
			<p class="seed-note">Fails if anything is already in <code>wiki_articles</code> — avoids duplicates.</p>
		</div>
	{/if}

	<ul class="list">
		{#each items as item (item.id)}
			<li class="item">
				{#if editingId === item.id}
					<form
						method="POST"
						action="?/update"
						class="form compact"
						novalidate
						use:enhance={() => async ({ update, result }) => {
							await update({ reset: false, invalidateAll: false });
							if (result.type === 'success') {
								editingId = null;
								await invalidateAll();
							}
						}}
					>
						<input type="hidden" name="id" value={editRowId} />
						<div class="row row-inline">
							<div>
								<label for="w-cat-{item.id}">Category</label>
								<select id="w-cat-{item.id}" name="category_id" bind:value={editCategoryId} required class="wide">
									{#each categories as cat}
										<option value={cat.id}>{cat.title}</option>
									{/each}
								</select>
							</div>
							<div>
								<label for="w-sort-{item.id}">Sort</label>
								<input id="w-sort-{item.id}" name="sort_order" type="number" bind:value={editSortOrder} min="0" />
							</div>
						</div>
						<div class="row row-inline">
							<div class="stretch">
								<label for="w-slug-{item.id}">Slug</label>
								<input id="w-slug-{item.id}" name="slug" bind:value={editSlug} required maxlength="160" />
							</div>
							<div class="stretch">
								<label for="w-title-{item.id}">Title</label>
								<input id="w-title-{item.id}" name="title" bind:value={editTitle} required maxlength="240" />
							</div>
						</div>
						<div class="row">
							<label for="w-exc-{item.id}">Description</label>
							<input id="w-exc-{item.id}" name="excerpt" bind:value={editExcerpt} maxlength="320" />
						</div>
						<div class="row">
							<label class="chk">
								<input name="hidden" type="checkbox" bind:checked={editHidden} />
								Hidden draft
							</label>
						</div>
						<div class="row">
							<label for="w-body-{item.id}">Body — Markdown</label>
							<textarea id="w-body-{item.id}" name="body" bind:value={editBody} rows="14" spellcheck="false"></textarea>
						</div>
						<div class="row actions">
							<button type="submit" class="btn primary" use:sound>Save</button>
							<button type="button" class="btn" onclick={() => (editingId = null)} use:sound>Cancel</button>
						</div>
					</form>
				{:else}
					<div class="item-preview wiki-item-preview">
						<div class="wiki-item-meta">
							<span class="item-id">{item.slug}</span>
							<span class="item-tag">{categoryTitle(item.category_id)}</span>
							{#if item.hidden}<span class="badge-draft">Draft</span>{/if}
						</div>
						<span class="item-q">{item.title}</span>
						<div class="wiki-item-links">
							<a
								href="/wiki/{item.category_id}/{item.slug}"
								target="_blank"
								rel="noopener noreferrer"
								use:sound
								class="link-muted">Preview</a
							>
						</div>
						<div class="item-actions">
							<button type="button" class="btn small" onclick={() => startEdit(item)} use:sound>Edit</button>
							<form
								method="POST"
								action="?/delete"
								style="display: inline"
								novalidate
								use:enhance={() => async ({ update, result }) => {
									await update({ reset: false, invalidateAll: false });
									if (result.type === 'success') await invalidateAll();
								}}
								onsubmit={(e) => {
									if (!confirm('Delete this article?')) e.preventDefault();
								}}
							>
								<input type="hidden" name="id" value={item.id} />
								<button type="submit" class="btn small danger" use:sound>Delete</button>
							</form>
						</div>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style lang="scss">
	.wiki-item-preview {
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
	}

	.wiki-item-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem 0.65rem;
		width: 100%;
	}

	.badge-draft {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.15rem 0.45rem;
		border-radius: 4px;
		background: var(--admin-error-bg);
		color: var(--admin-error);
	}

	.wiki-item-links {
		width: 100%;
	}

	.link-muted {
		font-size: 0.8125rem;
		color: var(--admin-accent);
		text-decoration: none;
		font-weight: 600;
	}

	.link-muted:hover {
		text-decoration: underline;
	}

	.muted {
		color: var(--admin-text-muted);
		font-size: 0.9375rem;

		code {
			font-size: 0.85em;
			padding: 0.08em 0.3em;
			border-radius: 4px;
			background: var(--admin-accent-soft);
		}
	}

	.empty-wiki {
		margin-bottom: 1rem;
		max-width: 44rem;

		& > p {
			margin: 0 0 0.85rem;
			line-height: 1.5;
		}
	}

	.seed-form {
		margin-bottom: 0.5rem;
	}

	.seed-note {
		font-size: 0.8125rem;
		opacity: 0.92;
		margin: 0;
	}

	.chk {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		user-select: none;
		font-size: 0.9375rem;
		color: var(--admin-text-muted);
	}

	select.wide,
	.stretch {
		min-width: 0;
	}

	.row-inline .stretch {
		flex: 1;
	}

	code {
		font-size: 0.875em;
	}

	.load-error {
		white-space: pre-wrap;
		word-break: break-word;
		font-family: inherit;
		font-size: 0.875rem;
		line-height: 1.45;
		max-width: 100%;
	}

	.section-hint {
		margin: 0 0 1rem;
		font-size: 0.875rem;
		line-height: 1.45;
		max-width: 48rem;
	}

	.h3 {
		margin: 0 0 0.75rem;
		font-size: 1rem;
		font-weight: 700;
	}

	.cat-form {
		margin-bottom: 1.25rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--admin-border, rgba(255, 255, 255, 0.08));
	}

	.cat-list {
		margin-top: 0.5rem;
	}

	.cat-row__head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem 0.65rem;
		width: 100%;
	}

	.cat-id {
		font-size: 0.8125rem;
	}

	.cat-sort {
		font-size: 0.75rem;
		opacity: 0.85;
		margin-left: auto;
	}

	.badge-db,
	.badge-builtin {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.12rem 0.4rem;
		border-radius: 4px;
	}

	.badge-db {
		background: var(--admin-accent-soft);
		color: var(--admin-accent);
	}

	.badge-builtin {
		background: rgba(255, 255, 255, 0.06);
		color: var(--admin-text-muted);
	}

	.cat-desc {
		margin: 0.25rem 0 0;
		font-size: 0.875rem;
		line-height: 1.4;
		width: 100%;
	}

	.mono-id {
		margin: 0.35rem 0 0;
		font-size: 0.8125rem;
		color: var(--admin-text-muted);
	}
</style>
