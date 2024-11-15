<script lang="ts">
	import { onMount } from 'svelte';
	import { openModal, selectedWork } from '$lib/stores';

	let showInfo = $state(false);
	let dialog: HTMLDialogElement | null = $state(null);

	$effect(() => {
		if ($openModal && dialog) {
			handleDialogOpen();
		} else {
			handleDialogClose();
			showInfo = false;
		}
	});

	function handleDialogOpen() {
		if (dialog) {
			dialog.showModal();
		}
	}

	function handleDialogClose() {
		if (dialog) {
			dialog.close();
			showInfo = false;
			$openModal = false;
			$selectedWork = null;
		}
	}

	onMount(() => {
		console.log('ImageModal mounted');
	});
</script>

<dialog bind:this={dialog} class="fixed inset-0 m-0 h-screen w-screen bg-transparent p-0">
	<div class="relative h-full w-full">
		<!-- Controls -->
		<div class="fixed right-8 top-8 z-[60] flex gap-2">
			<button
				type="button"
				aria-label="Toggle info"
				onclick={() => (showInfo = !showInfo)}
				class="rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
			>
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
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16v-4" />
					<path d="M12 8h.01" />
				</svg>
			</button>

			<button
				type="button"
				aria-label="Close dialog"
				onclick={handleDialogClose}
				class="rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
			>
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
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
			</button>
		</div>

		{#if $selectedWork}
			<!-- Image Container -->
			<div class="flex h-full w-full items-center justify-center p-4">
				<img
					src={$selectedWork.image}
					alt={$selectedWork.title}
					class="max-h-[85vh] rounded object-contain"
				/>
			</div>

			<!-- Info Panel -->
			{#if showInfo}
				<div
					class="fixed inset-x-0 bottom-8 z-50 mx-auto max-w-4xl rounded-xl bg-black/50 p-4 backdrop-blur-sm"
				>
					<div
						class="max-h-[60vh] overflow-y-auto p-4 text-white [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					>
						<div class="flex items-start justify-between gap-4">
							<h3 class="text-2xl font-semibold">{$selectedWork.title}</h3>
							{#if $selectedWork.tags?.length > 0}
								<div class="flex flex-wrap justify-end gap-2">
									{#each $selectedWork.tags as tag}
										<span class="rounded-full bg-white/10 px-2 py-1 text-xs font-medium">{tag}</span
										>
									{/each}
								</div>
							{/if}
						</div>

						{#if $selectedWork.description}
							<div class="mt-4 text-sm">
								{@html $selectedWork.description}
							</div>
						{/if}
						<p class="mt-4 text-sm text-gray-300">{$selectedWork.date}</p>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</dialog>

<style>
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(3px);
		animation: fade-in 0.3s ease-out;
	}

	dialog[open] {
		animation: slide-in 0.3s ease-out;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slide-in {
		from {
			transform: translateY(10%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	/* Remove default dialog styles */
	dialog {
		border: none;
		padding: 0;
	}

	dialog:focus {
		outline: none;
	}
</style>
