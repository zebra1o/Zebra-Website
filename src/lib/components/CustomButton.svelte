<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils/shadcn';
	interface Props {
		icon: any;
		iconClass?: string;
		buttonClass?: string;
		ariaLabel?: string;
		outline?: boolean;
		onClick: () => void;
	}

	let props: Props = $props();
	let outline = props.outline === undefined ? true : props.outline;
</script>

<Button
	size="icon"
	class={cn(
		props.buttonClass,
		'rounded-full bg-transparent p-0 hover:bg-transparent',
		outline &&
			'p-2 outline outline-[0.5px] outline-primary hover:!outline-primary focus:!outline focus:!outline-primary'
	)}
	onclick={props.onClick}
	aria-label={props.ariaLabel}
>
	<props.icon class={cn(props.iconClass, 'size-7 stroke-1 text-primary')}></props.icon>
</Button>
