<script lang="ts">
	import type { ModelFormat } from '$lib/types';
	import Logo3D from '../Logo3D.svelte';
	import GLTFViewer from './GLTFViewer.svelte';
	import SplatViewer from './SplatViewer.svelte';

	let {
		file,
		format,
		className,
		logo_3d
	}: { file: string; format: ModelFormat; className: string; logo_3d?: string } = $props();
</script>

<div class="h-full w-full rounded-lg bg-transparent {className}">
	{#if format === 'glb'}
		<GLTFViewer modelUrl={file} />
		<Logo3D {logo_3d} />
	{:else if format === 'splat'}
		<SplatViewer modelUrl={file} />
	{/if}
</div>
