<script lang="ts">
	import { openModal, selectedWork } from '$lib/stores';
	import X from 'lucide-svelte/icons/x';
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';

	import ModelViewer from './ModelViewer.svelte';
	import { queryParameters } from 'sveltekit-search-params';
	import CustomButton from '../CustomButton.svelte';
	import ImageViewer from './ImageViewer.svelte';
	import InfoPanel from './InfoPanel.svelte';
	import type { ModelFormat } from '$lib/types';

	let { logo_3d }: { logo_3d?: string } = $props();
	const params = queryParameters({
		art: true
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
	<div
		class="fixed right-5 top-5 z-[60] flex w-[90vw] flex-row-reverse justify-between gap-2 sm:right-6 sm:w-min sm:flex-col sm:justify-start"
	>
		<CustomButton
			ariaLabel="Close dialog"
			outline={false}
			icon={X}
			onClick={() => dialog?.close()}
		/>
		<CustomButton
			ariaLabel="Toggle info"
			iconClass="size-4"
			icon={EllipsisVertical}
			outline={false}
			onClick={() => (showInfo = !showInfo)}
		/>
	</div>

	<div class="relative">
		{#if $selectedWork}
			<!-- Content Container -->
			<div class="flex items-center justify-center">
				{#if $selectedWork.has_model && $selectedWork.model_format && $selectedWork.model_file}
					<div class="h-screen w-screen sm:h-[95vh] sm:w-[95vw]">
						<ModelViewer
							{logo_3d}
							format={$selectedWork.model_format as ModelFormat}
							file={$selectedWork.model_file}
							className="h-full w-full"
						/>
					</div>
				{:else}
					<ImageViewer />
				{/if}
			</div>
			{#if showInfo}
				<InfoPanel />
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
