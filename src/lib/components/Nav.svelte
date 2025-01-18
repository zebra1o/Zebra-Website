<script lang="ts">
	import { openAboutModal } from '$lib/stores';
	import type { Global } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import Filters from './Filters.svelte';
	let { tags, global }: { tags: string[]; global: Global } = $props();
</script>

<!-- About Button -->
<Button
	type="button"
	size="icon"
	class="fixed left-5 top-5 z-50 h-16 w-16 bg-transparent shadow-none hover:bg-transparent"
	onclick={() => ($openAboutModal = true)}
	aria-label="About"
>
	<enhanced:img
		fetchpriority="high"
		loading="eager"
		src={global.logo as string}
		width="64"
		height="64"
		alt={`${global.title} Logo`}
		class="h-16 w-16 object-contain"
	/>
</Button>

<Filters {tags} bg_image={global.filter_bg} />
