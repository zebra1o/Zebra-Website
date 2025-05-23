<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils/shadcn';
	interface Props {
		icon: any;
		iconClass?: string;
		buttonClass?: string;
		ariaLabel?: string;
		outline?: boolean;
		disabled?: boolean;
		onClick: () => void;
	}

	let props: Props = $props();
	let outline = props.outline === undefined ? true : props.outline;
</script>

<Button
	size="icon"
	class={cn(
		'cursor-pointer rounded-full bg-transparent p-0 shadow-none hover:bg-transparent focus:bg-transparent focus:!outline-none',
		props.buttonClass,
		outline &&
			'outline outline-1 outline-primary hover:!outline-primary focus:!outline focus:!outline-1 focus:!outline-primary'
	)}
	onclick={props.onClick}
	aria-label={props.ariaLabel}
	disabled={props.disabled}
>
	<props.icon
		class={cn(
			'size-7 stroke-[1.5px] text-primary drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]',
			props.iconClass
		)}
	></props.icon>
</Button>
