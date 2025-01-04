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

<div class="flex flex-col">
	<h3 class="border-b py-2 text-lg font-semibold">Tags</h3>
	{#each tags as tag}
		<Button
			class="w-full justify-start rounded-none border-b p-6 text-lg font-medium aria-selected:bg-primary/50 aria-selected:text-black"
			variant="link"
			onclick={() => handleTagClick(tag)}
			aria-selected={selectedTags.includes(slug(tag))}
		>
			{tag}
		</Button>
	{/each}
</div>
