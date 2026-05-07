<script lang="ts">
	import { enhance } from '$app/forms';
	import { sound } from '$lib/utils/sound';
	import type { FaqRow } from './+page.server';

	interface Props {
		data: {
			admin: { id: string; login: string };
			items: FaqRow[];
			error?: string;
			createError?: string;
			createSuccess?: boolean;
			updateError?: string;
			updateSuccess?: boolean;
			deleteError?: string;
			deleteSuccess?: boolean;
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
	let editingId = $state<string | null>(null);
	// Local form state so values don’t disappear on re-render after save
	let editQuestion = $state('');
	let editAnswer = $state('');
	let editTag = $state('ABOUT');
	let editSortOrder = $state(0);
	let editId = $state('');

	function startEdit(item: FaqRow) {
		editingId = item.id;
		editId = item.id;
		editQuestion = item.question;
		editAnswer = item.answer;
		editTag = item.tag;
		editSortOrder = item.sort_order;
	}

	const knownTags = ['ABOUT', 'INSTALLATION', 'DEVELOPMENT', 'WEAPONS', 'COMBAT', 'CRAFTING', 'UPDATES'];
</script>

<svelte:head>
	<title>FAQ — Admin</title>
</svelte:head>

<div class="page-header">
	<h1>FAQ</h1>
	<p class="sub">Edit FAQ items. Changes appear on the site <a href="/faq" target="_blank" rel="noopener">/faq</a>.</p>
	<a href="/admin" class="back-link" use:sound>← Dashboard</a>
</div>

{#if data?.error}
	<p class="msg error">Load error: {data.error}</p>
{/if}

{#if form?.createSuccess}
	<p class="msg success">Item added.</p>
{/if}
{#if form?.createError}
	<p class="msg error">{form.createError}</p>
{/if}
{#if form?.updateSuccess}
	<p class="msg success">Item updated.</p>
{/if}
{#if form?.updateError}
	<p class="msg error">{form.updateError}</p>
{/if}
{#if form?.deleteSuccess}
	<p class="msg success">Item deleted.</p>
{/if}
{#if form?.deleteError}
	<p class="msg error">{form.deleteError}</p>
{/if}

<section class="section">
	<h2>Add new</h2>
	<form method="POST" action="?/create" class="form" use:enhance>
		<div class="row">
			<label for="new-id">ID (slug, e.g. my-question)</label>
			<input id="new-id" name="id" type="text" required placeholder="my-question" />
		</div>
		<div class="row">
			<label for="new-question">Question</label>
			<input id="new-question" name="question" type="text" required />
		</div>
		<div class="row">
			<label for="new-answer">Answer</label>
			<textarea id="new-answer" name="answer" rows="4" required></textarea>
		</div>
		<div class="row row-inline">
			<div>
				<label for="new-tag">Tag</label>
				<input id="new-tag" name="tag" type="text" list="new-tag-list" placeholder="e.g. ABOUT or custom" />
				<datalist id="new-tag-list">
					{#each knownTags as t}
						<option value={t}></option>
					{/each}
				</datalist>
			</div>
			<div>
				<label for="new-sort">Sort order</label>
				<input id="new-sort" name="sort_order" type="number" value="0" min="0" />
			</div>
		</div>
		<button type="submit" class="btn primary" use:sound>Add item</button>
	</form>
</section>

<section class="section">
	<h2>Items ({items.length})</h2>
	<ul class="list">
		{#each items as item (item.id)}
			<li class="item">
				{#if editingId === item.id}
					<form
						method="POST"
						action="?/update"
						class="form compact"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success' && result.data?.updateSuccess) editingId = null;
							};
						}}
					>
						<input type="hidden" name="id" value={editId} />
						<div class="row">
							<label for="edit-q-{item.id}">Question</label>
							<input id="edit-q-{item.id}" name="question" type="text" bind:value={editQuestion} required />
						</div>
						<div class="row">
							<label for="edit-a-{item.id}">Answer</label>
							<textarea id="edit-a-{item.id}" name="answer" rows="3" bind:value={editAnswer} required></textarea>
						</div>
						<div class="row row-inline">
							<div>
								<label for="edit-tag-{item.id}">Tag</label>
								<input id="edit-tag-{item.id}" name="tag" type="text" list="edit-tag-list-{item.id}" bind:value={editTag} placeholder="e.g. ABOUT or custom" />
								<datalist id="edit-tag-list-{item.id}">
									{#each knownTags as t}
										<option value={t}></option>
									{/each}
								</datalist>
							</div>
							<div>
								<label for="edit-sort-{item.id}">Sort</label>
								<input id="edit-sort-{item.id}" name="sort_order" type="number" bind:value={editSortOrder} min="0" />
							</div>
						</div>
						<div class="row actions">
							<button type="submit" class="btn primary" use:sound>Save</button>
							<button type="button" class="btn" onclick={() => (editingId = null)} use:sound>Cancel</button>
						</div>
					</form>
				{:else}
					<div class="item-preview">
						<span class="item-id">{item.id}</span>
						<span class="item-tag">{item.tag}</span>
						<span class="item-q">{item.question}</span>
						<div class="item-actions">
							<button type="button" class="btn small" onclick={() => startEdit(item)} use:sound>Edit</button>
							<form
								method="POST"
								action="?/delete"
								style="display:inline"
								use:enhance
								onsubmit={(e) => { if (!confirm('Delete this item?')) e.preventDefault(); }}
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
	{#if items.length === 0}
		<p class="empty">No items. Add one above or run <code>node scripts/seed-faq.js</code> to copy existing FAQ from code.</p>
	{/if}
</section>
