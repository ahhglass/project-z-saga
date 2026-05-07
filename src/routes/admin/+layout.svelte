<script lang="ts">
	import './admin.css';
	import { sound } from '$lib/utils/sound';
	import { User as UserIcon, Exit as ExitIcon } from '$lib/icons';

	interface Props {
		data: { admin?: { id: string; login: string } };
		children: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
</script>

{#if data.admin}
	<div class="admin-layout">
		<header class="admin-header">
			<a href="/admin" class="logo" use:sound><h4>ADMIN DASHBOARD</h4></a>
			<nav>
				<a href="/admin" use:sound>Dashboard</a>
				<a href="/" target="_blank" rel="noopener" use:sound>View site</a>
				<span class="user">
					<span class="user-icon" aria-hidden="true"><UserIcon /></span>
					{data.admin.login}
				</span>
				<form method="POST" action="/admin/logout" class="logout-form">
					<button type="submit" class="logout" use:sound>
						<span class="logout-icon" aria-hidden="true"><ExitIcon /></span>
						Log out
					</button>
				</form>
			</nav>
		</header>
		<main class="admin-main" role="main">
			{@render children()}
		</main>
	</div>
{:else}
	{@render children()}
{/if}
