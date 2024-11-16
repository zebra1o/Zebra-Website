<script lang="ts">
	import type { ModelFormat } from '$lib/types';
	import GLTFViewer from './GLTFViewer.svelte';
	import SplatViewer from './SplatViewer.svelte';

	let { file, format, className }: { file: string; format: ModelFormat; className: string } =
		$props();
</script>

<div class="h-full w-full rounded-lg bg-transparent {className}">
	{#if format === 'glb'}
		<GLTFViewer modelUrl={file} />
	{:else if format === 'splat'}
		<SplatViewer modelUrl={file} />
	{/if}
</div>
