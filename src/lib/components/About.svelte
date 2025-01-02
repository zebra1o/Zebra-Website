<script lang="ts">
	import type { About } from '$lib/types';
	import { openAboutModal } from '$lib/stores';

	let { data }: { data: About } = $props();
	let activeTab = $state('bio');
	let dialog: HTMLDialogElement | null = $state(null);

	const tabs = ['bio', 'cv', 'contact'] as const;
	type Tab = (typeof tabs)[number];

	function setActiveTab(tab: Tab) {
		activeTab = tab;
	}

	$effect(() => {
		if ($openAboutModal && dialog) {
			dialog.showModal();
		}
	});

	function handleDialogClose() {
		$openAboutModal = false;
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	class="m-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border-none bg-black/95 p-8 text-white backdrop-blur-sm"
	onclose={handleDialogClose}
	onclick={(e) => {
		if (e.target === dialog) dialog?.close();
	}}
>
	<!-- Background image -->
	<div
		class="absolute inset-0 bg-contain bg-center bg-no-repeat"
		style="background-image: url({data.bg_image})"
	>
		<div class="absolute inset-0 bg-black/50"></div>
	</div>
	<!-- Close button -->
	<button
		type="button"
		aria-label="Close dialog"
		onclick={() => dialog?.close()}
		class="absolute right-4 top-4 rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
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
	<div class="relative">
		<!-- Rest of the about content -->
		<div class="mt-8">
			<div class="mb-8 flex flex-col items-center gap-8">
				{#if data.avatar}
					<img src={data.avatar} alt="About" class="max-h-72 w-auto object-contain" />
				{/if}

				<div class="flex gap-4">
					{#each tabs as tab}
						<button
							class="border-b-2 px-4 py-2 transition-colors duration-200 {activeTab === tab
								? 'border-white'
								: 'border-transparent hover:border-white/50'}"
							onclick={() => setActiveTab(tab)}
						>
							{tab.toUpperCase()}
						</button>
					{/each}
				</div>
			</div>

			<div class="mt-8">
				{#if activeTab === 'bio'}
					{#if data.bio}
						<div class="prose prose-invert max-w-none">
							{@html data.bio}
						</div>
					{/if}
				{:else if activeTab === 'cv'}
					{#if data.cv}
						<div class="space-y-8">
							{#if data.cv.education}
								<section>
									<h3 class="mb-4 text-xl font-semibold">Education</h3>
									{#each data.cv.education as edu}
										<div class="mb-6">
											<h4 class="text-lg font-medium">{edu.institution}</h4>
											<p class="text-gray-300">{edu.degree}</p>
											<p class="text-gray-400">{edu.year}</p>
										</div>
									{/each}
								</section>
							{/if}

							{#if data.cv.exhibitions}
								<section>
									<h3 class="mb-4 text-xl font-semibold">Exhibitions</h3>
									{#each data.cv.exhibitions as exhibition}
										<div class="mb-6">
											<h4 class="text-lg font-medium">{exhibition.title}</h4>
											<p class="text-gray-300">{exhibition.venue}</p>
											<p class="text-gray-400">{exhibition.year}</p>
											{#if exhibition.description}
												<p class="mt-2 italic text-gray-300">{exhibition.description}</p>
											{/if}
										</div>
									{/each}
								</section>
							{/if}
						</div>
					{/if}
				{:else if activeTab === 'contact'}
					<div class="space-y-4">
						{#if data.email}
							<div class="flex gap-2">
								<span class="font-medium">Email:</span>
								<a href="mailto:{data.email}" class="text-gray-300 hover:text-white">{data.email}</a
								>
							</div>
						{/if}

						{#if data.location}
							<div class="flex gap-2">
								<span class="font-medium">Location:</span>
								<p class="text-gray-300">{data.location}</p>
							</div>
						{/if}

						{#if data.social}
							<div class="mt-8 flex gap-4">
								{#each data.social as link}
									<a
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
										class="rounded border border-white/20 px-4 py-2 transition-colors duration-200 hover:bg-white/10"
									>
										{link.platform}
									</a>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
</dialog>

<style>
	dialog {
		color-scheme: normal;
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.8);
	}
</style>
