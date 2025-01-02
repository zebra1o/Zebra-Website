<script lang="ts">
	import { openAboutModal } from '$lib/stores';
	import { Button } from '$lib/components/ui/button';
	import Filters from './Filters.svelte';
	let { tags }: { tags: string[] } = $props();
</script>

<!-- About Button -->
<Button
	type="button"
	size="icon"
	class="fixed left-5 top-5 z-50 bg-transparent hover:bg-transparent"
	onclick={() => ($openAboutModal = true)}
	aria-label="About"
>
	<img
		src="/media/global/z_pixel_logo.png"
		width="64"
		height="64"
		alt="Pietra Logo"
		class="h-16 w-16 object-contain"
	/>

	<!-- <svg
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
	</svg> -->
</Button>

<Filters {tags} />
