<script lang="ts">
	import slug from 'slug';
	import { queryParameters, ssp } from 'sveltekit-search-params';
	import Work from '$lib/components/Work.svelte';
	import About from '$lib/components/About.svelte';
	import { isLoading, openModal, selectedWork } from '$lib/stores';
	import { onMount } from 'svelte';
	import { cacheImages } from '$lib/utils/imageCache';
	import ImageModal from '$lib/components/viewers/ImageModal.svelte';
	import type { About as AboutType, WorkMetadata } from '$lib/types';
	import Nav from '$lib/components/Nav.svelte';

	let { data }: { data: { works: WorkMetadata[]; about: AboutType; tags: string[] } } = $props();
	let works = data.works;
	let loadedImages = $state(0);

	const params = queryParameters({
		art: true,
		tags: ssp.array<string>()
	});

	let filteredWorks = $derived.by(() => {
		if (!params.tags || params.tags.length === 0) return works;
		return works.filter((work) => {
			return params.tags?.some((tag) => work.tags?.find((t) => slug(t) === tag));
		});
	});

	const totalImages = $derived(filteredWorks.length);

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

		if (params.art) {
			$selectedWork = works.find((work) => slug(work.title) === params.art) ?? null;
			$openModal = true;
		}

		// Just cache the images directly, no need for status check first
		const imageUrls = works.map((work) => work.image);
		cacheImages(imageUrls).catch(console.error);
	});

	$effect(() => {
		if (params.tags && params.tags.length === 0) {
			params.tags = null;
		}
	});
</script>

<Nav tags={data.tags} />
<About data={data.about} />
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
		{#each filteredWorks as work}
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
