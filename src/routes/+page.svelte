<script lang="ts">
	import Work from '$lib/components/Work.svelte';
	import { works } from '$lib/components/works.svelte';
	import { isLoading } from '$lib/stores';
	import { onMount } from 'svelte';
	import { cacheImages } from '$lib/utils/imageCache';
	import ImageModal from '$lib/components/viewers/ImageModal.svelte';

	let loadedImages = 0;
	const totalImages = works.length;

	function handleImageLoaded() {
		loadedImages++;
		if (loadedImages === totalImages) {
			setTimeout(() => {
				$isLoading = false;
			}, 500);
		}
	}

	onMount(() => {
		if (totalImages === 0) {
			$isLoading = false;
			return;
		}

		// Just cache the images directly, no need for status check first
		const imageUrls = works.map((work) => work.image);
		cacheImages(imageUrls).catch(console.error);
	});
</script>

{#if $isLoading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black">
		<div class="text-center text-white">
			<div class="mb-4 text-2xl">Loading...</div>
			<div class="h-1 w-48 rounded-full bg-gray-800">
				<div
					class="h-full rounded-full bg-white transition-all duration-300"
					style="width: {(loadedImages / totalImages) * 100}%"
				></div>
			</div>
		</div>
	</div>
{/if}

<ImageModal />

<div class="fixed inset-0 h-screen w-screen overflow-hidden bg-black">
	<div class="overflow-container relative h-full w-full">
		{#each works as work}
			<Work {work} onLoaded={handleImageLoaded} />
		{/each}
	</div>
</div>

<style>
	.overflow-container {
		position: relative;
		margin: 0 auto;
	}
</style>
