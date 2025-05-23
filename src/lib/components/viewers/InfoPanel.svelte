<script lang="ts">
	import { selectedWork } from '$lib/stores';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { gsap, Draggable } from '$lib/gsap.config';

	let draggableInstance: Draggable[] | null = $state(null);

	let infoElement: HTMLDivElement | null = $state(null);

	$effect.pre(() => {
		if ($selectedWork && infoElement) {
			draggableInstance = Draggable.create(infoElement, {
				type: 'x,y',
				bounds: '.overflow-container',
				cursor: 'grab',
				activeCursor: 'grabbing',
				minimumMovement: 1,
				onDragStart: function () {
					gsap.to(infoElement, {
						scale: 1,
						boxShadow: '-5px 10px 35px 0px rgba(255, 255, 255, 0.30)',
						duration: 0.2
					});
				},
				onDragEnd: function () {
					gsap.to(infoElement, {
						scale: 1.02,
						boxShadow: '-15px 20px 40px 5px rgba(255, 255, 255, 0.35)',
						duration: 0.2
					});
				}
			});
		}
	});
</script>

<!-- Info Panel -->
{#if $selectedWork}
	<div
		id="info"
		bind:this={infoElement}
		class="fixed inset-x-0 bottom-3 left-3 z-50 max-w-xs border-collapse rounded-xl bg-black/40 backdrop-blur-sm sm:bottom-8 sm:left-8 sm:max-w-2xl"
	>
		<div
			class="max-h-[50vh] overflow-y-auto p-3 text-white [-ms-overflow-style:none] [scrollbar-width:none] sm:px-4 sm:py-6 [&::-webkit-scrollbar]:hidden"
		>
			<div class="flex items-center justify-between gap-4">
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<h3 class="font-jacquard text-3xl tracking-widest sm:text-5xl">
								{$selectedWork.title}
							</h3>
						</Tooltip.Trigger>
						<Tooltip.Content>
							{$selectedWork.title}
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>

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
