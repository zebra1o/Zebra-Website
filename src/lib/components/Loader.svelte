<script lang="ts">
	import { untrack } from 'svelte';
	import { isLoading } from '$lib/stores';
	import { cacheImages } from '$lib/utils/imageCache';
	import type { WorkMetadata } from '$lib/types';

	let { works }: { works: WorkMetadata[] } = $props();

	$effect.pre(() => {
		untrack(() => {
			if (works.length === 0) {
				$isLoading = false;
				return;
			}
			const imageUrls = works.map((work) => work.image);
			cacheImages(imageUrls).catch(console.error);
			$isLoading = false;
		});
	});
</script>

{#if $isLoading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black">
		<div class="text-center text-white">
			<div class="mb-4 text-2xl">Loading...</div>
		</div>
	</div>
{/if}
