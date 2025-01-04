<script lang="ts">
	import { selectedWork } from '$lib/stores';
</script>

<!-- Info Panel -->
{#if $selectedWork}
	<div
		id="info"
		class="custom-zebra fixed inset-x-0 bottom-12 left-8 z-50 max-w-2xl border-collapse backdrop-blur-sm"
	>
		<div
			class="max-h-[60vh] overflow-y-auto px-4 py-6 text-white [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
		>
			<div class="flex items-start justify-between gap-4">
				<h3 class="text-xl font-semibold">{$selectedWork.title}</h3>
				{#if $selectedWork.tags?.length > 0}
					<div class="flex flex-col justify-end gap-2">
						{#each $selectedWork.tags as tag}
							<span class="text-xs font-medium">{tag}</span>
						{/each}
					</div>
				{/if}
			</div>

			<p class="mt-4 text-sm text-gray-300">{$selectedWork.year}</p>

			{#if $selectedWork.description}
				<div class="description-content mt-4 text-sm">
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
	.custom-zebra {
		border-radius: 18px;
		padding: 3px;
		background: rgba(0, 0, 0, 0.25);
	}

	.custom-zebra > div {
		border-radius: 16px;
		background: rgba(0, 0, 0, 0.25);
	}
</style>
