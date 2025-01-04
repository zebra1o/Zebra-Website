<script lang="ts">
	import { selectedWork } from '$lib/stores';
</script>

<!-- Info Panel -->
{#if $selectedWork}
	<div
		id="info"
		class="fixed inset-x-0 bottom-12 left-8 z-50 max-w-2xl border-collapse rounded-xl bg-black/20 backdrop-blur-sm"
	>
		<div
			class="max-h-[60vh] overflow-y-auto px-4 py-6 text-white [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
		>
			<div class="flex items-start justify-between gap-4">
				<h3 class="font-jacquard text-5xl leading-none tracking-widest">{$selectedWork.title}</h3>
				{#if $selectedWork.tags && $selectedWork.tags.length > 0}
					<div class="flex flex-col justify-end gap-2">
						{#each $selectedWork.tags as tag}
							<span class="text-xs font-medium text-primary/70">{tag}</span>
						{/each}
					</div>
				{/if}
			</div>

			<p class="mt-4 text-sm text-primary/70">{$selectedWork.year}</p>

			{#if $selectedWork.description}
				<div class="prose prose-invert mt-4 max-w-prose text-sm lg:prose-lg">
					{@html $selectedWork.description}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	#info {
		box-shadow: -15px 20px 50px 5px rgba(255, 255, 255, 0.35);
	}
</style>
