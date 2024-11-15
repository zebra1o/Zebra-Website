<script lang="ts">
	import { onMount } from 'svelte';
	import { openModal, selectedWork } from '$lib/stores';

	let showInfo = $state(false);
	let dialog: HTMLDialogElement | null = $state(null);
	let parsedDescription = $state('');

	$effect(() => {
		if ($selectedWork?.description) {
			// Simple markdown parsing for client-side
			parsedDescription = $selectedWork.description
				// Headers
				.replace(/^### (.*$)/gm, '<h3>$1</h3>')
				.replace(/^## (.*$)/gm, '<h2>$1</h2>')
				.replace(/^# (.*$)/gm, '<h1>$1</h1>')
				// Bold
				.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
				// Italic
				.replace(/\*(.*?)\*/g, '<em>$1</em>')
				// Links
				.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
				// Lists
				.replace(/^\s*\n\*/gm, '<ul>\n*')
				.replace(/^(\*.+)\s*\n([^\*])/gm, '$1\n</ul>\n$2')
				.replace(/^\*(.+)/gm, '<li>$1</li>')
				// Code
				.replace(/`([^`]+)`/g, '<code>$1</code>')
				// Paragraphs
				.replace(/^\s*(\n)?(.+)/gm, function(m) {
					return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>'+m+'</p>';
				})
				// Line breaks
				.replace(/\n/g, '<br>');
		}
	});

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
					{#if parsedDescription}
						<div class="prose prose-sm prose-invert max-w-none">
							{@html parsedDescription}
						</div>
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

	:global(.prose) {
		color: rgb(229 231 235); /* text-gray-200 */
	}

	:global(.prose strong) {
		color: white;
	}

	:global(.prose a) {
		color: rgb(96 165 250); /* text-blue-400 */
	}

	:global(.prose p) {
		margin: 0.5rem 0;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	:global(.prose h1, .prose h2, .prose h3, .prose h4) {
		color: white;
		margin: 1rem 0 0.5rem;
	}

	:global(.prose ul, .prose ol) {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	:global(.prose li) {
		margin: 0.25rem 0;
	}

	:global(.prose code) {
		color: rgb(199 210 254);
		background: rgba(0, 0, 0, 0.2);
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
	}

	:global(.prose pre) {
		background: rgba(0, 0, 0, 0.2);
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
	}
</style>
