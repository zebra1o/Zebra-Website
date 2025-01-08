<script lang="ts">
	import { viewerSettings, defaultSettings } from '$lib/stores/viewer-settings';
	import { gsap, Draggable } from '$lib/gsap.config';
	import {
		Accordion,
		AccordionContent,
		AccordionItem,
		AccordionTrigger
	} from '$lib/components/ui/accordion';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { Switch } from '$lib/components/ui/switch';
	import { Button } from '../ui/button';
	import { ScrollArea } from '../ui/scroll-area';
	import { RotateCcw, Link2, Link2Off } from 'lucide-svelte';
	import { onDestroy } from 'svelte';
	import { QualityPreset } from '../ui/quality-preset';
	import {
		qualityPresets,
		type MaterialPreset,
		materialPresets
	} from '$lib/stores/quality-presets';
	import * as Select from '../ui/select';

	type LightType = 'key' | 'fill' | 'rim';

	const lightTypes: LightType[] = ['key', 'fill', 'rim'];
	let colorsLinked = $state(false);

	let handleElement: HTMLDivElement | null = $state(null);
	let cardElement: HTMLDivElement | null = $state(null);
	let draggableInstance: Draggable[] | null = $state(null);

	function handleColorChange(light: LightType, color: string) {
		if (colorsLinked) {
			// Update all lights to the same color
			lightTypes.forEach((type) => {
				$viewerSettings.lights[type].color = color;
			});
		} else {
			// Update only the changed light
			$viewerSettings.lights[light].color = color;
		}
	}

	$effect(() => {
		if (cardElement && handleElement) {
			draggableInstance = Draggable.create(handleElement, {
				type: 'x,y',
				bounds: '.overflow-container',
				cursor: 'grab',
				activeCursor: 'grabbing',
				onDrag: () => {
					if (!draggableInstance) return;
					gsap.to(cardElement, {
						x: draggableInstance[0].x,
						y: draggableInstance[0].y,
						duration: 0,
						delay: 0
					});
				},
				dragClickables: true
			});
		}
		return () => {
			if (draggableInstance) {
				draggableInstance.forEach((instance) => {
					instance.kill();
				});
			}
			draggableInstance = null;
		};
	});

	onDestroy(() => {
		cardElement = null;
		draggableInstance = null;
	});

	function resetSettings() {
		$viewerSettings = structuredClone(defaultSettings);
		$viewerSettings.visible = true; // Keep panel open
	}

	// Add material preset options
	const materialPresetOptions = Object.entries(materialPresets).map(([id, preset]) => ({
		id: id as MaterialPreset,
		label: id.charAt(0).toUpperCase() + id.slice(1),
		description: `${preset.roughness.toFixed(1)} roughness, ${preset.metalness.toFixed(1)} metalness`
	}));
</script>

{#if $viewerSettings.visible}
	<div class="w-sm fixed right-4 top-20 max-h-[80vh] max-w-sm shadow-lg">
		<div
			id="handle"
			class="absolute inset-0 z-10 h-8 rounded-t-lg bg-primary/10 blur-sm"
			bind:this={handleElement}
		></div>
		<div bind:this={cardElement}>
			<Card class="w-sm max-w-sm pt-8">
				<CardHeader>
					<CardTitle>Viewer Settings</CardTitle>
					<CardDescription>Customize the 3D viewer appearance</CardDescription>
				</CardHeader>
				<CardContent>
					<ScrollArea class="w-sm h-[50vh]">
						<Accordion value="instructions" type="single">
							<AccordionItem value="instructions">
								<AccordionTrigger class="font-semibold">Instructions</AccordionTrigger>
								<AccordionContent class="w-sm">
									<div class="space-y-2 text-sm">
										<p>
											• Keep pressing and holding the <code>L</code> key and move your mouse to move
											the lights.
										</p>
										<p>• Adjust light settings to change scene illumination</p>
										<p>• Use global settings for overall scene control</p>
									</div>
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="lights" class="w-full">
								<AccordionTrigger class="font-semibold">Lights</AccordionTrigger>
								<AccordionContent class="w-full">
									{#each lightTypes as light}
										<div class="w-sm w-full space-y-4 py-4">
											<h4 class="text-lg font-semibold capitalize">{light} Light</h4>

											<div class="flex items-center gap-4">
												<Label>Color</Label>
												<div class="flex items-center gap-2">
													<input
														type="color"
														class="h-8 w-8 cursor-pointer appearance-none border-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
														value={$viewerSettings.lights[light].color}
														oninput={(e) => handleColorChange(light, e.currentTarget.value)}
													/>
													{#if light === 'key'}
														<Button
															variant="ghost"
															size="icon"
															class="h-8 w-8"
															title={colorsLinked ? 'Unlink colors' : 'Link colors'}
															onclick={() => (colorsLinked = !colorsLinked)}
														>
															{#if colorsLinked}
																<Link2 class="h-4 w-4" />
															{:else}
																<Link2Off class="h-4 w-4" />
															{/if}
														</Button>
													{/if}
												</div>
												<span class="text-sm text-muted-foreground">
													{$viewerSettings.lights[light].color}
												</span>
											</div>

											<div class="w-full space-y-2">
												<div class="flex items-center justify-between">
													<Label>Intensity</Label>
													<span class="text-sm text-muted-foreground">
														{$viewerSettings.lights[light].intensity.toFixed(1)}
													</span>
												</div>
												<Slider
													type="single"
													bind:value={$viewerSettings.lights[light].intensity}
													min={0}
													max={200}
													step={5}
												/>
											</div>

											<div class="w-full space-y-2">
												<div class="flex items-center justify-between">
													<Label>Distance</Label>
													<span class="text-sm text-muted-foreground">
														{$viewerSettings.lights[light].distance.toFixed(1)}
													</span>
												</div>
												<Slider
													type="single"
													bind:value={$viewerSettings.lights[light].distance}
													min={1}
													max={30}
													step={1}
												/>
											</div>
										</div>
									{/each}
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value="global">
								<AccordionTrigger class="font-semibold">Global Settings</AccordionTrigger>
								<AccordionContent>
									<div class="space-y-6">
										<QualityPreset
											value={$viewerSettings.global.qualityPreset}
											onValueChange={(value) => ($viewerSettings.global.qualityPreset = value)}
										/>

										<div class="space-y-4">
											<h4 class="font-medium">Material Preset</h4>
											<Select.Root type="single" bind:value={$viewerSettings.global.materialPreset}>
												<Select.Trigger class="w-full">
													{materialPresetOptions.find(
														(opt) => opt.id === $viewerSettings.global.materialPreset
													)?.label ?? 'Select material'}
												</Select.Trigger>
												<Select.Content
													portalProps={{ disabled: true }}
													side={'bottom'}
													class="z-[100]"
												>
													<Select.Group>
														{#each materialPresetOptions as option}
															<Select.Item value={option.id} label={option.label}>
																<div class="grid gap-1">
																	<div class="font-medium">{option.label}</div>
																	<div class="text-sm text-muted-foreground">
																		{option.description}
																	</div>
																</div>
															</Select.Item>
														{/each}
													</Select.Group>
												</Select.Content>
											</Select.Root>
										</div>

										<div class="space-y-2">
											<div class="flex items-center justify-between">
												<Label>Global Light Intensity</Label>
												<span class="text-sm text-muted-foreground">
													{$viewerSettings.global.lightIntensity.toFixed(1)}
												</span>
											</div>
											<Slider
												type="single"
												bind:value={$viewerSettings.global.lightIntensity}
												min={0}
												max={5}
												step={0.1}
											/>
										</div>

										<div class="space-y-2">
											<div class="flex items-center justify-between">
												<Label>Center Distance</Label>
												<span class="text-sm text-muted-foreground">
													{$viewerSettings.global.centerDistance.toFixed(1)}
												</span>
											</div>
											<Slider
												type="single"
												bind:value={$viewerSettings.global.centerDistance}
												min={1}
												max={20}
												step={0.5}
											/>
										</div>

										<div class="flex items-center justify-between">
											<div class="flex flex-col gap-1">
												<Label>Shadows</Label>
												{#if !qualityPresets[$viewerSettings.global.qualityPreset].features.shadows}
													<span class="text-xs text-muted-foreground"
														>Not available in current quality preset</span
													>
												{/if}
											</div>
											<Switch
												bind:checked={$viewerSettings.global.shadows}
												disabled={!qualityPresets[$viewerSettings.global.qualityPreset].features
													.shadows}
											/>
										</div>

										<div class="flex items-center justify-between">
											<div class="flex flex-col gap-1">
												<Label>Bloom Effect</Label>
												{#if !qualityPresets[$viewerSettings.global.qualityPreset].features.bloom}
													<span class="text-xs text-muted-foreground"
														>Not available in current quality preset</span
													>
												{/if}
											</div>
											<Switch
												bind:checked={$viewerSettings.global.bloom}
												disabled={!qualityPresets[$viewerSettings.global.qualityPreset].features
													.bloom}
											/>
										</div>

										<div class="flex items-center justify-between">
											<Label>Show Helpers</Label>
											<Switch bind:checked={$viewerSettings.global.showHelpers} />
										</div>
									</div>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</ScrollArea>
				</CardContent>
				<CardFooter class="flex items-center justify-between">
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8"
						title="Reset to defaults"
						onclick={resetSettings}
					>
						<RotateCcw class="h-4 w-4" />
					</Button>
					<Button size="lg" onclick={() => ($viewerSettings.visible = false)}>Close</Button>
				</CardFooter>
			</Card>
		</div>
	</div>
{/if}
