<script lang="ts">
	import type { ViewerProps } from '$lib/types/viewer.types';
	import GLTFViewer from './viewers/GLTFViewer.svelte';
	import SplatViewer from './viewers/SplatViewer.svelte';

	const props: ViewerProps = $props();
	const viewerType = $derived(() => {
		if (!props.modelUrl) return null;
		return ['splat', 'ksplat'].includes(getFileExtension(props.modelUrl)) ? 'splat' : 'gltf';
	});

	function getFileExtension(url: string): string {
		return url?.split('.').pop()?.toLowerCase() || '';
	}
</script>

<div class="relative h-full w-full overflow-hidden rounded-lg bg-white shadow">
	<div class="p-4">
		<h3 class="text-lg font-medium text-gray-900">{props.title || 'Model Viewer'}</h3>
		{#if props.description}
			<p class="mt-1 text-sm text-gray-500">{props.description}</p>
		{/if}
	</div>

	{#if viewerType() === 'splat'}
		<SplatViewer modelUrl={props.modelUrl} />
	{:else if viewerType() === 'gltf'}
		<GLTFViewer modelUrl={props.modelUrl} />
	{/if}
</div>
