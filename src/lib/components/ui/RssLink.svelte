<script lang="ts">
	import { Rss as RssIcon } from '$lib/icons';
	import { sound } from '$lib/utils/sound';
</script>

<a href="/rss.xml" target="_blank" rel="noopener noreferrer" title="Subscribe to my RSS Feed" use:sound>
	<RssIcon />
</a>

<style lang="scss">
	a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		transition: all 0.2s ease-in-out;
		color: var(--color--text);
		fill: var(--color--text);

		&:hover {
			color: var(--color--primary);
			fill: var(--color--primary);
			filter: drop-shadow(0px 0px 3px var(--color--primary));
		}
	}
</style>
