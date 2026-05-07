<script lang="ts">
	import { sound } from '$lib/utils/sound';

	interface Props {
		data: { admin: { id: string; login: string } };
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Admin</title>
</svelte:head>

<div class="page-header">
	<h1>Dashboard</h1>
	<p class="sub">Logged in as <strong>{data.admin.login}</strong>.</p>
</div>

<section class="cards">
	<a href="/admin/news" class="dashboard-card" use:sound>
		<h2>News</h2>
		<p>Manage news posts and cover images.</p>
		<span>Edit news →</span>
	</a>
	<a href="/admin/team" class="dashboard-card" use:sound>
		<h2>Team</h2>
		<p>Manage team sections and members.</p>
		<span>Edit team →</span>
	</a>
	<a href="/admin/faq" class="dashboard-card" use:sound>
		<h2>FAQ</h2>
		<p>Manage FAQ items and tags.</p>
		<span>Edit FAQ →</span>
	</a>
	<a href="/admin/settings" class="dashboard-card" use:sound>
		<h2>Settings</h2>
		<p>Site meta, hero, server IP.</p>
		<span>Settings →</span>
	</a>
</section>
