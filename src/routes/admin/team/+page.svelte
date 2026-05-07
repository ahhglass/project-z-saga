<script lang="ts">
	import { enhance } from '$app/forms';
	import { sound } from '$lib/utils/sound';
	import type { TeamSectionRow, TeamMemberRow } from './+page.server';

	interface Props {
		data: {
			admin: { id: string; login: string };
			sections: TeamSectionRow[];
			members: TeamMemberRow[];
			error?: string;
		};
		form?: Record<string, unknown>;
	}

	let { data, form }: Props = $props();

	const sections = $derived(data?.sections ?? []);
	const members = $derived(data?.members ?? []);

	function membersFor(sectionId: string) {
		return members.filter((m) => m.section_id === sectionId);
	}

	let editingSectionId = $state<string | null>(null);
	let editSectionId = $state('');
	let editSectionTitle = $state('');
	let editSectionSort = $state(0);

	let editingMemberId = $state<string | null>(null);
	let editMemberId = $state('');
	let editMemberSectionId = $state('');
	let editMemberName = $state('');
	let editMemberRole = $state('');
	let editMemberDesc = $state('');
	let editMemberAvatar = $state('');
	let editMemberTags = $state('');
	let editMemberSocials = $state('');
	let editMemberSort = $state(0);

	function socialsToText(arr: { url: string; type: string; label?: string }[]): string {
		return (arr ?? []).map((s) => [s.url, s.type, s.label].filter(Boolean).join(' ')).join('\n');
	}

	function startEditSection(sec: TeamSectionRow) {
		editingSectionId = sec.id;
		editSectionId = sec.id;
		editSectionTitle = sec.title;
		editSectionSort = sec.sort_order;
	}

	function startEditMember(m: TeamMemberRow) {
		editingMemberId = m.id;
		editMemberId = m.id;
		editMemberSectionId = m.section_id;
		editMemberName = m.name;
		editMemberRole = m.role;
		editMemberDesc = m.description ?? '';
		editMemberAvatar = m.avatar ?? '';
		editMemberTags = (m.tags ?? []).join(', ');
		editMemberSocials = socialsToText(m.socials ?? []);
		editMemberSort = m.sort_order;
	}
</script>

<svelte:head>
	<title>Team — Admin</title>
</svelte:head>

<div class="page-header">
	<h1>Team</h1>
	<p class="sub">Edit sections and members. Changes on <a href="/team" target="_blank" rel="noopener">/team</a>.</p>
	<a href="/admin" class="back-link" use:sound>← Dashboard</a>
</div>

{#if data?.error}
	<p class="msg error">Load error: {data.error}</p>
{/if}
{#if form?.createSectionSuccess}
	<p class="msg success">Section added.</p>
{/if}
{#if form?.createSectionError}
	<p class="msg error">{form.createSectionError}</p>
{/if}
{#if form?.updateSectionSuccess}
	<p class="msg success">Section updated.</p>
{/if}
{#if form?.updateSectionError}
	<p class="msg error">{form.updateSectionError}</p>
{/if}
{#if form?.deleteSectionSuccess}
	<p class="msg success">Section deleted.</p>
{/if}
{#if form?.deleteSectionError}
	<p class="msg error">{form.deleteSectionError}</p>
{/if}
{#if form?.createMemberSuccess}
	<p class="msg success">Member added.</p>
{/if}
{#if form?.createMemberError}
	<p class="msg error">{form.createMemberError}</p>
{/if}
{#if form?.updateMemberSuccess}
	<p class="msg success">Member updated.</p>
{/if}
{#if form?.updateMemberError}
	<p class="msg error">{form.updateMemberError}</p>
{/if}
{#if form?.deleteMemberSuccess}
	<p class="msg success">Member deleted.</p>
{/if}
{#if form?.deleteMemberError}
	<p class="msg error">{form.deleteMemberError}</p>
{/if}

<section class="section">
	<h2>Add section</h2>
	<form method="POST" action="?/createSection" class="form inline-form" use:enhance>
		<div class="row">
			<label for="new-sec-id">ID (slug)</label>
			<input id="new-sec-id" name="id" type="text" required placeholder="my-section" />
		</div>
		<div class="row">
			<label for="new-sec-title">Title</label>
			<input id="new-sec-title" name="title" type="text" required />
		</div>
		<div class="row">
			<label for="new-sec-sort">Sort order</label>
			<input id="new-sec-sort" name="sort_order" type="number" value="0" min="0" />
		</div>
		<button type="submit" class="btn primary" use:sound>Add section</button>
	</form>
</section>

<section class="section">
	<h2>Sections</h2>
	{#each sections as sec (sec.id)}
		<div class="card">
			{#if editingSectionId === sec.id}
				<form method="POST" action="?/updateSection" class="form compact" use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success' && result.data?.updateSectionSuccess) editingSectionId = null;
						};
					}}>
					<input type="hidden" name="id" value={editSectionId} />
					<div class="row">
						<label for="edit-sec-title-{sec.id}">Title</label>
						<input id="edit-sec-title-{sec.id}" name="title" type="text" bind:value={editSectionTitle} required />
					</div>
					<div class="row">
						<label for="edit-sec-sort-{sec.id}">Sort order</label>
						<input id="edit-sec-sort-{sec.id}" name="sort_order" type="number" bind:value={editSectionSort} min="0" />
					</div>
					<div class="row actions">
						<button type="submit" class="btn primary" use:sound>Save</button>
						<button type="button" class="btn" onclick={() => (editingSectionId = null)} use:sound>Cancel</button>
					</div>
				</form>
			{:else}
				<div class="card-header">
					<h3>{sec.title}</h3>
					<span class="meta">id: {sec.id}</span>
					<div class="actions">
						<button type="button" class="btn small" onclick={() => startEditSection(sec)} use:sound>Edit</button>
						<form method="POST" action="?/deleteSection" style="display:inline" use:enhance onsubmit={(e) => { if (!confirm('Delete section and all its members?')) e.preventDefault(); }}>
							<input type="hidden" name="id" value={sec.id} />
							<button type="submit" class="btn small danger" use:sound>Delete section</button>
						</form>
					</div>
				</div>
			{/if}

			<!-- Members in this section -->
			<div class="members-list">
				<h4>Members ({membersFor(sec.id).length})</h4>
				{#each membersFor(sec.id) as m (m.id)}
					<div class="member-row">
						{#if editingMemberId === m.id}
							<form method="POST" action="?/updateMember" class="form compact" use:enhance={() => {
									return async ({ result }) => {
										if (result.type === 'success' && result.data?.updateMemberSuccess) editingMemberId = null;
									};
								}}>
								<input type="hidden" name="id" value={editMemberId} />
								<input type="hidden" name="section_id" value={editMemberSectionId} />
								<div class="row">
									<label for="edit-name-{m.id}">Name</label>
									<input id="edit-name-{m.id}" name="name" bind:value={editMemberName} required />
								</div>
								<div class="row">
									<label for="edit-role-{m.id}">Role</label>
									<input id="edit-role-{m.id}" name="role" bind:value={editMemberRole} />
								</div>
								<div class="row">
									<label for="edit-desc-{m.id}">Description</label>
									<input id="edit-desc-{m.id}" name="description" bind:value={editMemberDesc} />
								</div>
								<div class="row">
									<label for="edit-avatar-{m.id}">Avatar URL</label>
									<input id="edit-avatar-{m.id}" name="avatar" bind:value={editMemberAvatar} placeholder="/images/team/avatar.webp" />
								</div>
								<div class="row">
									<label for="edit-tags-{m.id}">Tags (comma-separated)</label>
									<input id="edit-tags-{m.id}" name="tags" bind:value={editMemberTags} />
								</div>
								<div class="row">
									<label for="edit-socials-{m.id}">Socials (one per line: url type label)</label>
									<textarea id="edit-socials-{m.id}" name="socials" bind:value={editMemberSocials} rows="4" placeholder="https://t.me/x telegram&#10;https://github.com/x github"></textarea>
								</div>
								<div class="row">
									<label for="edit-sort-{m.id}">Sort order</label>
									<input id="edit-sort-{m.id}" name="sort_order" type="number" bind:value={editMemberSort} min="0" />
								</div>
								<div class="row actions">
									<button type="submit" class="btn primary" use:sound>Save</button>
									<button type="button" class="btn" onclick={() => (editingMemberId = null)} use:sound>Cancel</button>
								</div>
							</form>
						{:else}
							<div class="member-preview">
								<span class="name">{m.name}</span>
								<span class="role">{m.role}</span>
								<div class="actions">
									<button type="button" class="btn small" onclick={() => startEditMember(m)} use:sound>Edit</button>
									<form method="POST" action="?/deleteMember" style="display:inline" use:enhance onsubmit={(e) => { if (!confirm('Delete this member?')) e.preventDefault(); }}>
										<input type="hidden" name="id" value={m.id} />
										<button type="submit" class="btn small danger" use:sound>Delete</button>
									</form>
								</div>
							</div>
						{/if}
					</div>
				{/each}

				<!-- Add member to this section -->
				<form method="POST" action="?/createMember" class="form add-member-form" use:enhance>
					<input type="hidden" name="section_id" value={sec.id} />
					<input type="hidden" name="sort_order" value={membersFor(sec.id).length} />
					<div class="row row-inline">
						<input name="name" type="text" placeholder="Name" required />
						<input name="role" type="text" placeholder="Role" />
						<button type="submit" class="btn primary small" use:sound>Add member</button>
					</div>
				</form>
			</div>
		</div>
	{/each}
	{#if sections.length === 0}
		<p class="empty">No sections. Add one above or run <code>node scripts/seed-team.js</code>.</p>
	{/if}
</section>
