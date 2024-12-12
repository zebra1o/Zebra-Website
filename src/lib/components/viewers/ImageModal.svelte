<script lang="ts">
	import { openModal, selectedWork } from '$lib/stores';
	import ModelViewer from './ModelViewer.svelte';
	import { queryParameters } from 'sveltekit-search-params';

	const params = queryParameters({
		i: true
	});

	let showInfo = $state(false);
	let dialog: HTMLDialogElement | null = $state(null);

	$effect(() => {
		if ($openModal && dialog) {
			dialog.showModal();
		}
	});

	function handleDialogClose() {
		params.art = null;
		showInfo = false;
		$openModal = false;
		$selectedWork = null;
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<dialog
	bind:this={dialog}
	class="m-auto bg-transparent p-0"
	onclose={handleDialogClose}
	onclick={(e) => {
		if (e.target === dialog) dialog?.close();
	}}
>
	<!-- Controls - moved outside the relative container -->
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
			onclick={() => dialog?.close()}
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

	<div class="relative">
		{#if $selectedWork}
			<!-- Content Container -->
			<div class="flex items-center justify-center">
				{#if $selectedWork.has_model && $selectedWork.model_format && $selectedWork.model_file}
					<div class="h-[85vh] w-[85vw]">
						<ModelViewer
							format={$selectedWork.model_format}
							file={$selectedWork.model_file}
							className="h-full w-full"
						/>
					</div>
				{:else}
					<img
						src={$selectedWork.image}
						alt={$selectedWork.title}
						class="max-h-[85vh] max-w-[85vw] rounded object-contain"
					/>
				{/if}
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

						<p class="mt-4 text-sm text-gray-300">{$selectedWork.year}</p>

						{#if $selectedWork.description}
							<div class="description-content mt-4 text-sm">
								{@html $selectedWork.description}
							</div>
						{/if}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</dialog>

<style>
	dialog {
		border: none;
		max-width: 100vw;
		max-height: 100vh;
		color-scheme: normal;
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.8);
	}

	/* Remove all default focus states */
	:global(*:focus) {
		outline: none !important;
		box-shadow: none !important;
		-webkit-tap-highlight-color: transparent;
	}

	:global(*:focus-visible) {
		outline: none !important;
		box-shadow: none !important;
	}

	:global(button:focus) {
		outline: none !important;
	}

	:global(img:focus) {
		outline: none !important;
	}

	/* Description Content Styles */
	:global(.description-content) {
		/* Spacing */
		line-height: 1.6;

		/* Text styles */
		color: rgb(229 231 235);
	}

	:global(.description-content h1) {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: white;
	}

	:global(.description-content p) {
		margin: 0.75rem 0;
	}

	:global(.description-content strong) {
		color: white;
		font-weight: 600;
	}

	:global(.description-content em) {
		color: rgb(209 213 219);
	}

	:global(.description-content s) {
		color: rgb(156 163 175);
	}

	:global(.description-content ol) {
		list-style-type: decimal;
		padding-left: 1.5rem;
		margin: 1rem 0;
	}

	:global(.description-content li) {
		margin: 0.5rem 0;
	}

	:global(.description-content li p) {
		margin: 0;
	}

	:global(.description-content blockquote) {
		border-left: 3px solid rgb(75 85 99);
		padding-left: 1rem;
		margin: 1rem 0;
		font-style: italic;
	}

	:global(.description-content img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		margin: 1rem auto;
	}

	:global([style*='text-align: center']) {
		text-align: center;
	}

	:global([style*='text-align: justify']) {
		text-align: justify;
	}
</style>
