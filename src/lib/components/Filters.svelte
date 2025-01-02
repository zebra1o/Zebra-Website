<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Input } from '$lib/components/ui/input';
	import X from 'lucide-svelte/icons/x';
	import Tags from './Tags.svelte';
	let { tags }: { tags: string[] } = $props();
	import { queryParameters, ssp } from 'sveltekit-search-params';
	const params = queryParameters({
		tags: ssp.array<string>()
	});
	import { Badge } from '$lib/components/ui/badge';
</script>

<Sheet.Root>
	<Sheet.Trigger
		class="fixed right-5 top-5 z-50 flex flex-row gap-2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
	>
		{#if params.tags}
			<div class="flex flex-row items-center justify-between gap-2">
				{#each params.tags as tag}
					<Badge>{tag}</Badge>
				{/each}
			</div>
		{/if}
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
			<circle cx="10.5" cy="10.5" r="7.5" />
			<line x1="16.5" y1="16.5" x2="21" y2="21" />
		</svg>
	</Sheet.Trigger>
	<Sheet.Content class="flex flex-col gap-4 rounded-lg border border-primary" side="right">
		<div class="flex flex-row items-center justify-between gap-2">
			<Input type="search" placeholder="Search" />
			<Sheet.Close
				class="transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
			>
				<X class="size-8" strokeWidth={1} />
				<span class="sr-only">Close</span>
			</Sheet.Close>
		</div>
		<Tags {tags} />
	</Sheet.Content>
</Sheet.Root>
