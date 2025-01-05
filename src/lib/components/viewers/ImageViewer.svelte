<script lang="ts">
	import { Plus, Minus } from 'lucide-svelte';
	import CustomButton from '../CustomButton.svelte';
	import { Separator } from '../ui/separator';
	import { selectedWork } from '$lib/stores';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { useZoomImageWheel } from '@zoom-image/svelte';
	import Loader from '../Loader.svelte';

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
			// Add any additional cleanup if needed
		};

		return cleanup;
	});

	onDestroy(() => {
		if (cleanup) cleanup();
	});

	function zoomIn() {
		if (zoomImageInstance && zoomState.currentZoom < 4) {
			zoomImageInstance.setZoomImageState({
				currentZoom: zoomState.currentZoom + 0.5
			});
		}
	}

	function zoomOut() {
		if (zoomImageInstance && zoomState.currentZoom > 1) {
			zoomImageInstance.setZoomImageState({
				currentZoom: zoomState.currentZoom - 0.5
			});
		}
	}
</script>

<div class="fixed bottom-8 right-8 z-[60] flex flex-col items-center justify-center">
	<CustomButton
		ariaLabel="Zoom In"
		iconClass="size-4"
		icon={Plus}
		onClick={zoomIn}
		disabled={zoomState.currentZoom >= 4}
	/>
	<Separator orientation="vertical" class="h-[40px] w-[0.5px] bg-primary" />
	<CustomButton
		ariaLabel="Zoom Out"
		iconClass="size-4"
		icon={Minus}
		onClick={zoomOut}
		disabled={zoomState.currentZoom <= 1}
	/>
</div>

{#if $selectedWork}
	<div class="mt-1 grid h-full max-h-[85vh] w-full max-w-[85vw] place-content-center">
		<div bind:this={imageWheelContainer} class="h-full w-full transition-all duration-500">
			<enhanced:img
				fetchpriority="high"
				loading="eager"
				src={$selectedWork.image as string}
				alt={$selectedWork.title}
				class="h-full w-full cursor-grab object-contain active:cursor-grabbing"
			/>
		</div>
	</div>
{/if}
