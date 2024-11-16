<script lang="ts">
	import Work from '$lib/components/Work.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import { isLoading, openProfileModal } from '$lib/stores';
	import { onMount } from 'svelte';
	import { cacheImages } from '$lib/utils/imageCache';
	import ImageModal from '$lib/components/viewers/ImageModal.svelte';
	import type { Profile as ProfileType, WorkMetadata } from '$lib/types';

	let { data }: { data: { works: WorkMetadata[]; profile: ProfileType } } = $props();
	let works = data.works;

	let loadedImages = $state(0);
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

<!-- Profile Button -->
<button
	type="button"
	class="fixed left-5 top-5 z-50 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
	onclick={() => ($openProfileModal = true)}
	aria-label="Open Profile"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<circle cx="12" cy="8" r="5" />
		<path d="M20 21a8 8 0 1 0-16 0" />
	</svg>
</button>

<Profile data={data.profile} />
<ImageModal />

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
