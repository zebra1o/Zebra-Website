<script lang="ts">
	import { queryParameters, ssp } from 'sveltekit-search-params';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import Tags from './Tags.svelte';
	import Search from './Search.svelte';
	import { SearchIcon, X } from 'lucide-svelte';

	let { tags, bg_image }: { tags: string[]; bg_image?: string } = $props();

	const params = queryParameters({
		tags: ssp.array<string>(),
		search: true
	});
</script>

<Sheet.Root>
	<Sheet.Trigger
		class="fixed right-5 top-5 z-50 flex flex-row gap-2 rounded-full bg-transparent p-2 text-white hover:bg-transparent"
	>
		{#if params.tags || params.search}
			<div class="flex flex-row items-center justify-between gap-2">
				{#if params.tags}
					{#each params.tags as tag}
						<Badge>{tag}</Badge>
					{/each}
				{/if}
				{#if params.search}
					<Badge>{params.search}</Badge>
				{/if}
			</div>
		{/if}
		<SearchIcon strokeWidth={1} />
	</Sheet.Trigger>
	<Sheet.Content class="flex flex-col gap-4 rounded-lg border border-primary" side="right">
		<div class="z-50 flex flex-col gap-4">
			<div class="flex flex-row items-center justify-between gap-2">
				<Search />
				<Sheet.Close
					class="transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
				>
					<X class="size-8" strokeWidth={1} />
					<span class="sr-only">Close</span>
				</Sheet.Close>
			</div>
			<Tags {tags} />
		</div>
		{#if bg_image}
			<div
				class="absolute inset-0 z-0 h-full w-full bg-cover bg-center bg-no-repeat"
				style="background-image: url({bg_image})"
			></div>
		{/if}
	</Sheet.Content>
</Sheet.Root>
