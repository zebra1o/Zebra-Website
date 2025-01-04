<script lang="ts">
	import type { About } from '$lib/types';
	import { openAboutModal } from '$lib/stores';
	import Button from './ui/button/button.svelte';
	import CustomButton from './CustomButton.svelte';
	import { X } from 'lucide-svelte';
	import { ScrollArea } from './ui/scroll-area';

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
	class="m-auto max-h-[90vh] w-full max-w-3xl overflow-clip rounded-xl border-none bg-black/95 p-8 text-white backdrop-blur-sm"
	onclose={handleDialogClose}
	onclick={(e) => {
		if (e.target === dialog) dialog?.close();
	}}
>
	<CustomButton
		buttonClass="absolute right-4 top-4"
		outline={false}
		icon={X}
		onClick={() => dialog?.close()}
	/>
	<div class="flex flex-col items-center gap-6">
		<!-- Rest of the about content -->
		{#if data.avatar}
			<enhanced:img
				fetchpriority="low"
				loading="lazy"
				src={data.avatar as string}
				alt="About"
				class="z-50 h-full max-h-40 w-auto object-contain"
			/>
		{/if}

		<div class="relative flex w-full flex-col gap-6 overflow-visible">
			<!-- Background image -->
			{#if data.bg_image}
				<div
					class="absolute inset-0 z-0 h-full min-h-96 scale-125 bg-contain bg-center bg-no-repeat"
					style="background-image: url({data.bg_image})"
				></div>
			{/if}
			<div class="z-50 flex w-full flex-col items-start gap-8">
				<h3 class="w-full text-center font-jacquard text-6xl">zebra</h3>
				<div class="flex w-full flex-row items-center justify-between gap-16 px-2">
					{#each tabs as tab}
						<Button
							class="w-full rounded-full bg-transparent font-jaini text-2xl font-medium tracking-[0.25em] text-primary/30 hover:border-primary/30 hover:bg-transparent hover:text-primary aria-checked:border-primary aria-checked:text-primary"
							size="lg"
							variant="outline"
							aria-checked={activeTab === tab}
							onclick={() => setActiveTab(tab)}
						>
							{tab}
						</Button>
					{/each}
				</div>

				<div class="mb-6 flex w-full items-center justify-center">
					<ScrollArea class="max-h-64 overflow-y-auto">
						{#if activeTab === 'bio'}
							{#if data.bio}
								<div class="prose prose-invert max-w-prose lg:prose-lg">
									{@html data.bio}
								</div>
							{/if}
						{:else if activeTab === 'cv'}
							{#if data.cv}
								<div class="space-y-8">
									{#if data.cv.education}
										<section>
											<h3 class="text-xl font-semibold">Education</h3>
											{#each data.cv.education as edu}
												<div>
													<h4 class="text-lg font-medium">{edu.institution}</h4>
													<p class="text-gray-300">{edu.degree}</p>
													<p class="text-gray-400">{edu.year}</p>
												</div>
											{/each}
										</section>
									{/if}

									{#if data.cv.exhibitions}
										<section>
											<h3 class="text-xl font-semibold">Exhibitions</h3>
											{#each data.cv.exhibitions as exhibition}
												<div>
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
										<a href="mailto:{data.email}" class="text-gray-300 hover:text-white"
											>{data.email}</a
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
					</ScrollArea>
				</div>
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
