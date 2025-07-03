<script lang="ts">
	let { logo_3d }: { logo_3d?: string } = $props();
	import { viewerSettings } from '$lib/stores/viewer-settings';
	import ViewerSettings from './viewers/ViewerSettings.svelte';
</script>

{#if logo_3d}
	<button
		onclick={() => ($viewerSettings.visible = !$viewerSettings.visible)}
		class="absolute bottom-0 right-0 bg-transparent"
	>
		<img alt="logo_3d" src={logo_3d} width="100" height="100" class="pixelated" />
	</button>
	{#if $viewerSettings.visible}
		<ViewerSettings />
	{/if}
{/if}
