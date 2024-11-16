<script lang="ts">
	import type { ModelFormat } from '$lib/types';
	import GLTFViewer from './viewers/GLTFViewer.svelte';
	import SplatViewer from './viewers/SplatViewer.svelte';

	export let format: ModelFormat;
	export let file: string;
</script>

<div class="m-2 h-full w-full rounded-lg bg-transparent">
	{#if format === 'glb'}
		<GLTFViewer modelUrl={file} />
	{:else if format === 'splat'}
		<SplatViewer modelUrl={file} />
	{/if}
</div>
