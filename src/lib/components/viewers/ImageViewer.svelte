<script lang="ts">
	import { Plus, Minus } from 'lucide-svelte';
	import CustomButton from '../CustomButton.svelte';
	import { Separator } from '../ui/separator';
	import { selectedWork } from '$lib/stores';
	import { useZoomImageWheel } from '@zoom-image/svelte';
	import { type ZoomImageWheelState } from '@zoom-image/core';
	import { onMount } from 'svelte';

	// svelte-ignore non_reactive_update
	let imageWheelContainer: HTMLDivElement;
	let {
		createZoomImage: createZoomImageWheel,
		zoomImageState: zoomImageWheelState,
		setZoomImageState: setZoomImageWheelState
	} = useZoomImageWheel();

	let zoomImageWheelStateValue = $state<ZoomImageWheelState>() as ZoomImageWheelState;

	zoomImageWheelState.subscribe((value) => {
		zoomImageWheelStateValue = value;
	});

	onMount(() => {
		createZoomImageWheel(imageWheelContainer);
	});

	function zoomIn() {
		setZoomImageWheelState({
			currentZoom: zoomImageWheelStateValue.currentZoom + 0.5
		});
	}

	function zoomOut() {
		setZoomImageWheelState({
			currentZoom: zoomImageWheelStateValue.currentZoom - 0.5
		});
	}
</script>

<div class="fixed bottom-8 right-8 z-[60] flex flex-col items-center justify-center">
	<CustomButton
		ariaLabel="Zoom In"
		iconClass="size-4"
		icon={Plus}
		onClick={zoomIn}
		disabled={zoomImageWheelStateValue.currentZoom >= 4}
	/>
	<Separator orientation="vertical" class="h-[40px] w-[0.5px] bg-primary" />
	<CustomButton
		ariaLabel="Zoom Out"
		iconClass="size-4"
		icon={Minus}
		onClick={zoomOut}
		disabled={zoomImageWheelStateValue.currentZoom <= 1}
	/>
</div>

{#if $selectedWork}
	<div class="mt-1 grid h-full max-h-[85vh] w-full max-w-[85vw] place-content-center">
		<div bind:this={imageWheelContainer} class="h-full w-full transition-all duration-500">
			<img
				src={$selectedWork.image}
				alt={$selectedWork.title}
				class="h-full w-full object-contain"
			/>
		</div>
	</div>
{/if}
