<script lang="ts">
	import ThreeViewer from '$lib/components/ThreeViewer.svelte';

	type Model = {
		title: string;
		description?: string;
		url: string;
		type: 'gltf' | 'splat';
	};

	const models: Model[] = [
		{
			title: 'GLB Model',
			description: 'A GLB model with DRACO compression',
			url: '/models/bocciolo_metallic.glb',
			type: 'gltf'
		},
		{
			title: 'Gaussian Splat',
			description: 'A Gaussian Splat visualization',
			url: '/models/cactino.splat',
			type: 'splat'
		}
	];

	let openModal = $state(false);
	let selectedModel = $state<Model | null>(null);
	let dialog: HTMLDialogElement;

	$effect(() => {
		if (openModal && dialog) {
			dialog.showModal();
		} else if (dialog) {
			dialog.close();
		}
	});

	function handleModelClick(model: Model) {
		selectedModel = model;
		openModal = true;
	}

	function handleDialogClose() {
		openModal = false;
		selectedModel = null;
	}
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">3D Model Viewer</h1>

	<!-- Grid of model cards -->
	<div class="grid gap-6 md:grid-cols-2">
		{#each models as model}
			<button
				class="group relative overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-lg"
				onclick={() => handleModelClick(model)}
			>
				<!-- Preview Card -->
				<div class="aspect-square w-full">
					<div class="relative flex h-full w-full items-center justify-center bg-gray-100">
						<!-- Placeholder Icon -->
						<div class="text-gray-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="48"
								height="48"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path
									d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
								/>
								<polyline points="3.27 6.96 12 12.01 20.73 6.96" />
								<line x1="12" y1="22.08" x2="12" y2="12" />
							</svg>
						</div>
						<!-- Model Info -->
						<div class="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
							<h3 class="text-lg font-medium text-white">{model.title}</h3>
							{#if model.description}
								<p class="mt-1 text-sm text-gray-200">{model.description}</p>
							{/if}
							<span class="mt-2 inline-block rounded-full bg-white/20 px-2 py-1 text-xs text-white">
								{model.type.toUpperCase()}
							</span>
						</div>
					</div>
				</div>
				<!-- Hover Overlay -->
				<div
					class="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20"
				>
					<span
						class="rounded-full bg-black/50 px-4 py-2 text-sm text-white opacity-0 transition-all group-hover:opacity-100"
						>View Model</span
					>
				</div>
			</button>
		{/each}
	</div>

	<!-- Modal Dialog -->
	<dialog
		bind:this={dialog}
		class="fixed inset-0 m-0 h-screen w-screen bg-transparent p-0"
		onclose={handleDialogClose}
	>
		<div class="relative h-full w-full">
			<!-- Controls -->
			<div class="fixed right-8 top-8 z-[60]">
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

			{#if selectedModel}
				<!-- Model Container -->
				<div class="flex h-full w-full items-center justify-center bg-gray-900/95 p-4">
					<div class="h-full max-h-[85vh] w-full max-w-7xl rounded-lg">
						<ThreeViewer
							title={selectedModel.title}
							description={selectedModel.description}
							modelUrl={selectedModel.url}
							height="100%"
						/>
					</div>
				</div>
			{/if}
		</div>
	</dialog>
</div>

<style>
	dialog {
		background-color: transparent;
		border: none;
		padding: 0;
		max-width: 100vw;
		max-height: 100vh;
		margin: 0;
		color-scheme: normal;
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.8);
	}

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
</style>
