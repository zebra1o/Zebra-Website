<script lang="ts">
	let {
		src,
		alt,
		isOpen,
		onclose
	}: { src: string; alt: string; isOpen: boolean; onclose: () => void } = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (isOpen && dialog) {
			dialog.showModal();
		} else if (dialog) {
			dialog.close();
		}
	});

	function handleClose() {
		onclose();
	}

	function handleDialogClose(event: Event) {
		const target = event.target as HTMLDialogElement;
		if (target === dialog) {
			handleClose();
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="fixed inset-0 z-50 m-auto h-fit max-h-[90vh] w-fit max-w-[90vw] bg-transparent p-4"
	onclose={handleDialogClose}
>
	<button
		type="button"
		aria-label="Close dialog"
		onclick={handleClose}
		onkeydown={(e) => e.key === 'Enter' && handleClose()}
		class="fixed right-8 top-8 z-[60] p-2 text-white"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	</button>
	<div class="relative rounded-lg p-1">
		<img {src} {alt} class="max-h-[85vh] rounded object-contain" />
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
		border-radius: 8px;
	}

	dialog:focus {
		outline: none;
	}
</style>
