<script lang="ts">
	import { Plus, Minus } from 'lucide-svelte';
	import CustomButton from '../CustomButton.svelte';
	import { Separator } from '../ui/separator';
	import { selectedWork } from '$lib/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	// svelte-ignore non_reactive_update
	let imageWheelContainer: HTMLDivElement;
	let zoomState = $state({
		currentZoom: 1
	});

	let zoomImage: any = null;

	onMount(async () => {
		if (browser) {
			const { useZoomImageWheel } = await import('@zoom-image/svelte');
			zoomImage = useZoomImageWheel();
			zoomImage.zoomImageState.subscribe((value: any) => {
				zoomState.currentZoom = value.currentZoom;
			});
			zoomImage.createZoomImage(imageWheelContainer);
		}
	});

	function zoomIn() {
		if (zoomImage) {
			zoomImage.setZoomImageState({
				currentZoom: zoomState.currentZoom + 0.5
			});
		}
	}

	function zoomOut() {
		if (zoomImage) {
			zoomImage.setZoomImageState({
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
			<img
				src={$selectedWork.image}
				alt={$selectedWork.title}
				class="h-full w-full object-contain"
			/>
		</div>
	</div>
{/if}
