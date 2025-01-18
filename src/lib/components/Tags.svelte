<script lang="ts">
	let { tags }: { tags: string[] } = $props();
	import { queryParameters, ssp } from 'sveltekit-search-params';
	import Button from './ui/button/button.svelte';
	import slug from 'slug';

	const params = queryParameters({
		tags: ssp.array<string>()
	});

	let selectedTags: string[] = $state(params.tags ?? []);

	function handleTagClick(tag: string) {
		if (selectedTags.includes(slug(tag))) {
			selectedTags = selectedTags.filter((t) => t !== slug(tag));
		} else {
			selectedTags.push(slug(tag));
		}
		if (selectedTags.length === 0) {
			params.tags = null;
		} else {
			params.tags = selectedTags;
		}
	}
</script>

<div class="flex flex-col gap-2 overflow-y-auto">
	{#each tags as tag, i}
		<div class="group flex flex-row items-center justify-between gap-2 px-3 py-1">
			<Button
				class="peer w-full justify-start rounded-none text-lg font-thin tracking-widest text-primary/80 group-hover:font-semibold group-hover:text-primary aria-selected:font-bold aria-selected:text-primary"
				variant="link"
				onclick={() => handleTagClick(tag)}
				aria-selected={selectedTags.includes(slug(tag))}
			>
				{tag}
			</Button>
			<div class="size-2 rounded-full peer-aria-selected:bg-primary"></div>
		</div>
		{#if i < tags.length - 1}
			<hr class="bg-primary/50" />
		{/if}
	{/each}
</div>
