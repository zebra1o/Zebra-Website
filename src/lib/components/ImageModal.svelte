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

<dialog
	bind:this={dialog}
	class="fixed inset-0 z-50 m-auto h-fit max-h-[90vh] w-fit max-w-[90vw] bg-transparent p-4"
>
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
		<div class="relative rounded-lg p-1">
			<img 
				src={$selectedWork.image} 
				alt={$selectedWork.title} 
				class="max-h-[85vh] rounded object-contain" 
			/>

			{#if showInfo}
				<div class="absolute bottom-0 left-0 right-0 bg-black/50 p-4 text-white backdrop-blur-sm">
					<h3 class="mb-2 text-lg font-semibold">{$selectedWork.title}</h3>
					{#if $selectedWork.tags?.length > 0}
						<div class="mb-2 flex flex-wrap gap-2">
							{#each $selectedWork.tags as tag}
								<span class="rounded-full bg-white/10 px-2 py-1 text-sm">{tag}</span>
							{/each}
						</div>
					{/if}
					{#if $selectedWork.description}
						<p class="text-sm text-gray-200">{$selectedWork.description}</p>
					{/if}
					<p class="mt-2 text-sm text-gray-300">{$selectedWork.date}</p>
				</div>
			{/if}
		</div>
	{/if}
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
		border-radius: 8px;
	}

	dialog:focus {
		outline: none;
	}
</style>
