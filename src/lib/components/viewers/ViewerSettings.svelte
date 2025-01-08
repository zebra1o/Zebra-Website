<script lang="ts">
	import { viewerSettings } from '$lib/stores/viewer-settings';
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
	import { onDestroy } from 'svelte';
	import { Button } from '../ui/button';
	import { ScrollArea, ScrollAreaScrollbar } from '../ui/scroll-area';

	type LightType = 'key' | 'fill' | 'rim';

	const lightTypes: LightType[] = ['key', 'fill', 'rim'];

	let handleElement: HTMLDivElement | null = $state(null);
	let cardElement: HTMLDivElement | null = $state(null);
	let draggableInstance: Draggable[] | null = $state(null);

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
											<div class="w-full space-y-2">
												<Label>Intensity</Label>
												<Slider
													type="single"
													bind:value={$viewerSettings.lights[light].intensity}
													min={0}
													max={2}
													step={0.1}
												/>
											</div>

											<div class="w-full space-y-2">
												<Label>Distance</Label>
												<Slider
													type="single"
													bind:value={$viewerSettings.lights[light].distance}
													min={1}
													max={20}
													step={0.5}
												/>
											</div>
										</div>
									{/each}
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value="global">
								<AccordionTrigger class="font-semibold">Global Settings</AccordionTrigger>
								<AccordionContent>
									<div class="space-y-4">
										<div class="space-y-2">
											<Label>Group Distance</Label>
											<Slider
												type="single"
												bind:value={$viewerSettings.global.groupDistance}
												min={5}
												max={20}
												step={0.5}
											/>
										</div>

										<div class="space-y-2">
											<Label>Center Distance</Label>
											<Slider
												type="single"
												bind:value={$viewerSettings.global.centerDistance}
												min={1}
												max={10}
												step={0.5}
											/>
										</div>

										<div class="flex items-center justify-between">
											<Label>Bloom Effect</Label>
											<Switch bind:checked={$viewerSettings.global.bloom} />
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
				<CardFooter class="flex justify-end">
					<Button size="lg" onclick={() => ($viewerSettings.visible = false)}>Close</Button>
				</CardFooter>
			</Card>
		</div>
	</div>
{/if}
