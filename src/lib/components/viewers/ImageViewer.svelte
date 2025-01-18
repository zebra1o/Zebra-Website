<script lang="ts">
	import { selectedWork } from '$lib/stores';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { useZoomImageWheel } from '@zoom-image/svelte';

	// svelte-ignore non_reactive_update
	let imageWheelContainer: HTMLDivElement;
	let zoomState = $state({
		currentZoom: 1
	});

	let cleanup: (() => void) | null = null;
	let zoomImageInstance: ReturnType<typeof useZoomImageWheel> | null = null;

	onMount(() => {
		if (!browser) return;

		zoomImageInstance = useZoomImageWheel();
		const unsubscribe = zoomImageInstance.zoomImageState.subscribe((value) => {
			zoomState.currentZoom = value.currentZoom;
		});

		zoomImageInstance.createZoomImage(imageWheelContainer);

		cleanup = () => {
			unsubscribe();
		};

		return cleanup;
	});

	onDestroy(() => {
		if (cleanup) cleanup();
	});
</script>

{#if $selectedWork}
	<div class="mt-1 grid h-full w-full place-content-center sm:max-h-[85vh] sm:max-w-[85vw]">
		<div
			bind:this={imageWheelContainer}
			class="h-[95vh] w-[95vw] transition-all duration-500 sm:h-[85vh] sm:w-[85vw]"
		>
			<enhanced:img
				fetchpriority="high"
				loading="eager"
				src={$selectedWork.image as string}
				alt={$selectedWork.title}
				class="h-full w-full cursor-grab object-contain active:cursor-grabbing sm:max-h-[85vh] sm:max-w-[85vw]"
			/>
		</div>
	</div>
{/if}
