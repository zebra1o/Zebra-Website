<script lang="ts">
	import { RadioGroup, RadioGroupItem } from '../radio-group';
	import type { QualityPreset } from '$lib/stores/viewer-settings';

	export let value: QualityPreset;
	export let onValueChange: (value: QualityPreset) => void;

	const qualityOptions: Array<{ id: QualityPreset; label: string; description: string }> = [
		{
			id: 'low',
			label: 'Low',
			description: 'Best for mobile or low-end devices'
		},
		{
			id: 'default',
			label: 'Default',
			description: 'Balanced performance and quality'
		},
		{
			id: 'high',
			label: 'High',
			description: 'Maximum visual quality'
		}
	];

	function handleValueChange(newValue: string) {
		if (newValue === 'low' || newValue === 'default' || newValue === 'high') {
			onValueChange(newValue);
		}
	}
</script>

<div class="space-y-4">
	<h4 class="font-medium">Quality Settings</h4>
	<RadioGroup {value} class="gap-4" onValueChange={handleValueChange}>
		{#each qualityOptions as option}
			<div class="flex items-start space-x-3 space-y-0">
				<RadioGroupItem value={option.id} id={option.id} />
				<div class="grid gap-1.5 leading-none">
					<label
						for={option.id}
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						{option.label}
					</label>
					<p class="text-sm text-muted-foreground">
						{option.description}
					</p>
				</div>
			</div>
		{/each}
	</RadioGroup>
</div>
