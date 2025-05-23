<script lang="ts">
	import {
		viewerSettings,
		defaultSettings,
		createInitialSettings
	} from '$lib/stores/viewer-settings';
	import { Draggable } from '$lib/gsap.config';
	import { Slider } from '$lib/components/ui/slider';
	import { Switch } from '$lib/components/ui/switch';
	import Link2 from 'lucide-svelte/icons/link-2';
	import Link2Off from 'lucide-svelte/icons/link-2-off';
	import { onDestroy } from 'svelte';
	import {
		qualityPresets,
		type MaterialPreset,
		materialPresets
	} from '$lib/stores/quality-presets';
	// import { Select, SelectContent, SelectItem, SelectTrigger, SelectGroup } from '../ui/select';
	import * as Select from '$lib/components/ui/select';
	import { detectOptimalQuality } from '$lib/utils/quality-detector';

	type LightType = 'key' | 'fill' | 'rim';

	const lightTypes: LightType[] = ['key', 'fill', 'rim'];
	let colorsLinked = $state(false);

	let handleElement: HTMLButtonElement | null = $state(null);
	let cardElement: HTMLDivElement | null = $state(null);
	let draggableInstance: Draggable[] | null = $state(null);

	function handleColorChange(light: LightType, color: string) {
		if (colorsLinked) {
			lightTypes.forEach((type) => {
				$viewerSettings.lights[type].color = color;
			});
		} else {
			$viewerSettings.lights[light].color = color;
		}
	}

	$effect(() => {
		if (!cardElement || !handleElement) return;

		draggableInstance = Draggable.create(cardElement, {
			type: 'x,y',
			trigger: handleElement,
			bounds: '.overflow-container',
			cursor: 'grab',
			activeCursor: 'grabbing'
		});

		return () => {
			if (draggableInstance) {
				draggableInstance.forEach((instance) => instance.kill());
			}
			draggableInstance = null;
		};
	});

	onDestroy(() => {
		cardElement = null;
		handleElement = null;
		draggableInstance = null;
	});

	function resetSettings() {
		$viewerSettings = {
			...createInitialSettings(),
			visible: true
		};
	}

	const materialPresetOptions = Object.entries(materialPresets).map(([id, preset]) => ({
		id: id as MaterialPreset,
		label: id.charAt(0).toUpperCase() + id.slice(1),
		description: `roughness ${preset.roughness.toFixed(1)}, metalness ${preset.metalness.toFixed(1)}`
	}));

	let globalSettingsOpen = $state(true);
	let lightSettingsOpen = $state(false);
</script>

{#if $viewerSettings.visible}
	<div
		bind:this={cardElement}
		class="fixed right-10 top-24 h-[calc(100vh-10rem)] w-[320px] font-mono text-xs"
	>
		<!-- Top Handler -->
		<div class="relative bg-black p-4">
			<button bind:this={handleElement} class="h-5 w-full rounded-full outline outline-white"
				>{''}</button
			>
		</div>

		<!-- Main Panel -->
		<div class="h-[calc(100%-0.5rem)] touch-none" style="touch-action: none;">
			<div class="flex h-full flex-col bg-black px-4 pb-4 text-white">
				<!-- Header -->
				<div class="mb-4 space-y-1.5">
					<h2 class="text-base uppercase tracking-[0.2em]">Viewer Settings</h2>
					<div class="space-y-0.5 text-[10px] text-neutral-400">
						<p>• Press L and move mouse to move lights</p>
						<p>• Lock lights settings for simplified controls</p>
						<p>• Just have fun</p>
					</div>
				</div>

				<div class="flex-1 space-y-4 overflow-y-auto">
					<!-- Global Settings -->
					<div class="space-y-3">
						<button
							class="flex w-full items-center justify-between border-b border-white/20 pb-1"
							onclick={() => (globalSettingsOpen = !globalSettingsOpen)}
						>
							<span class="text-sm uppercase tracking-wider">Global Settings</span>
							<span class="text-[10px]">{globalSettingsOpen ? '▼' : '▶'}</span>
						</button>

						{#if globalSettingsOpen}
							<div class="space-y-6">
								<!-- Quality -->
								<div class="rounded border border-white/20 p-3">
									<h4 class="mb-4 text-sm uppercase tracking-wider">Quality</h4>
									<div class="flex justify-between gap-4">
										<label class="flex items-center gap-2">
											<input
												type="radio"
												name="quality"
												value="low"
												checked={$viewerSettings.global.qualityPreset === 'low'}
												onchange={() => ($viewerSettings.global.qualityPreset = 'low')}
												class="accent-white"
											/>
											<span class="text-xs uppercase">LOW</span>
										</label>
										<label class="flex items-center gap-2">
											<input
												type="radio"
												name="quality"
												value="default"
												checked={$viewerSettings.global.qualityPreset === 'default'}
												onchange={() => ($viewerSettings.global.qualityPreset = 'default')}
												class="accent-white"
											/>
											<span class="text-xs uppercase">DEFAULT</span>
										</label>
										<label class="flex items-center gap-2">
											<input
												type="radio"
												name="quality"
												value="high"
												checked={$viewerSettings.global.qualityPreset === 'high'}
												onchange={() => ($viewerSettings.global.qualityPreset = 'high')}
												class="accent-white"
											/>
											<span class="text-xs uppercase">HIGH</span>
										</label>
									</div>
								</div>

								<!-- Material Presets -->
								<div class="space-y-2">
									<h4 class="text-sm uppercase tracking-wider">Material Presets</h4>
									<div class="rounded border border-white/20">
										<Select.Root type="single" bind:value={$viewerSettings.global.materialPreset}>
											<Select.Trigger class="w-full bg-transparent px-3 py-2 text-left uppercase">
												<span class="text-xs">
													{materialPresetOptions.find(
														(opt) => opt.id === $viewerSettings.global.materialPreset
													)?.label ?? 'Select material'}
												</span>
											</Select.Trigger>
											<Select.Content
												side="bottom"
												sideOffset={4}
												portalProps={{ disabled: true }}
												class="z-[1000] rounded border border-white/20 bg-black"
											>
												<Select.Group>
													{#each materialPresetOptions as option}
														<Select.Item
															value={option.id}
															label={option.label}
															class="cursor-pointer px-3 py-2 text-left uppercase hover:bg-white/10"
														>
															<div class="flex flex-col">
																<span class="text-xs">{option.label}</span>
																<span class="text-[10px] text-neutral-400"
																	>{option.description}</span
																>
															</div>
														</Select.Item>
													{/each}
												</Select.Group>
											</Select.Content>
										</Select.Root>
									</div>
								</div>

								<!-- Global Light Intensity -->
								<div class="space-y-2">
									<span class="text-xs lowercase">global light intensity</span>
									<Slider
										type="single"
										bind:value={$viewerSettings.global.lightIntensity}
										min={0}
										max={5}
										step={0.1}
										class="slider-white"
									/>
								</div>

								<!-- Center Distance -->
								<div class="space-y-2">
									<span class="text-xs lowercase">center distance</span>
									<Slider
										type="single"
										bind:value={$viewerSettings.global.centerDistance}
										min={1}
										max={20}
										step={0.5}
										class="slider-white"
									/>
								</div>

								<!-- Toggles -->
								<div class="space-y-3">
									<div class="flex items-center justify-between">
										<span class="text-xs uppercase">Shadows</span>
										<Switch
											bind:checked={$viewerSettings.global.shadows}
											disabled={!qualityPresets[$viewerSettings.global.qualityPreset].features
												.shadows}
											class="switch-white"
										/>
									</div>

									<div class="flex items-center justify-between">
										<span class="text-xs uppercase">Bloom Effect</span>
										<Switch
											bind:checked={$viewerSettings.global.bloom}
											disabled={!qualityPresets[$viewerSettings.global.qualityPreset].features
												.bloom}
											class="switch-white"
										/>
									</div>

									<div class="flex items-center justify-between">
										<span class="text-xs uppercase">Show Helpers</span>
										<Switch
											bind:checked={$viewerSettings.global.showHelpers}
											class="switch-white"
										/>
									</div>
								</div>
							</div>
						{/if}
					</div>

					<!-- Light Settings -->
					<div class="space-y-3">
						<button
							class="flex w-full items-center justify-between border-b border-white/20 pb-1"
							onclick={() => (lightSettingsOpen = !lightSettingsOpen)}
						>
							<span class="text-sm uppercase tracking-wider">Light Settings</span>
							<span class="text-[10px]">{lightSettingsOpen ? '▼' : '▶'}</span>
						</button>

						{#if lightSettingsOpen}
							<div class="space-y-6">
								{#each lightTypes as light}
									<div>
										<div class="rounded border border-white/10 p-4">
											<div class="mb-6">
												<h4 class="text-lg uppercase tracking-[0.2em]">{light} Light</h4>
												<div class="mt-3 flex items-center gap-3">
													<input
														type="color"
														class="h-8 w-8 cursor-pointer appearance-none rounded border border-white/10 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
														value={$viewerSettings.lights[light].color}
														oninput={(e) => handleColorChange(light, e.currentTarget.value)}
													/>
													{#if light === 'key'}
														<button
															class="text-white/30 hover:text-white/50"
															title={colorsLinked ? 'Unlink colors' : 'Link colors'}
															onclick={() => (colorsLinked = !colorsLinked)}
														>
															{#if colorsLinked}
																<Link2 class="h-4 w-4" />
															{:else}
																<Link2Off class="h-4 w-4" />
															{/if}
														</button>
													{/if}
													<span class="font-mono text-xs uppercase text-white/60">
														{$viewerSettings.lights[light].color}
													</span>
												</div>
											</div>

											<!-- Intensity -->
											<div class="mb-6">
												<span class="mb-2 block text-[10px] lowercase text-white/40">intensity</span
												>
												<Slider
													type="single"
													bind:value={$viewerSettings.lights[light].intensity}
													min={0}
													max={200}
													step={5}
													class="slider-white"
												/>
											</div>

											<!-- Distance -->
											<div>
												<span class="mb-2 block text-[10px] lowercase text-white/40">distance</span>
												<Slider
													type="single"
													bind:value={$viewerSettings.lights[light].distance}
													min={1}
													max={30}
													step={1}
													class="slider-white"
												/>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				<!-- Footer -->
				<div class="mt-4 flex items-center justify-between">
					<button
						class="rounded border border-white/20 px-6 py-1.5 text-xs uppercase hover:bg-white/5"
						onclick={resetSettings}
					>
						clear
					</button>
					<button
						class="rounded border border-white/20 px-6 py-1.5 text-xs uppercase hover:bg-white/5"
						onclick={() => ($viewerSettings.visible = false)}
					>
						ok
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(.slider-white) {
		--thumb-color: white;
		--track-color: rgba(255, 255, 255, 0.1);
		--track-focus-color: rgba(255, 255, 255, 0.2);
	}

	/* Slider thumb styling */
	:global(.slider-white [data-slider-thumb]) {
		@apply h-4 w-4;
		border: 2px solid white;
	}

	/* Slider track styling */
	:global(.slider-white [data-slider-track]) {
		@apply h-0.5;
		background-color: rgba(255, 255, 255, 0.2);
	}

	:global(.slider-white [data-slider-range]) {
		@apply h-0.5;
		background-color: white;
	}

	:global(.switch-white) {
		--thumb-color: white;
		--track-color: rgba(255, 255, 255, 0.1);
		--track-focus-color: rgba(255, 255, 255, 0.2);
	}

	/* Custom radio button styles */
	input[type='radio'] {
		appearance: none;
		width: 16px;
		height: 16px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		margin: 0;
		position: relative;
	}

	input[type='radio']:checked::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 8px;
		height: 8px;
		background-color: white;
		border-radius: 50%;
	}

	input[type='radio']:hover {
		border-color: rgba(255, 255, 255, 0.4);
	}
</style>
