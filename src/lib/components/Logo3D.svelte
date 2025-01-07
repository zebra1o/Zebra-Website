<script lang="ts">
	let { logo_3d }: { logo_3d?: string } = $props();
</script>

{#if logo_3d}
	<div class="absolute bottom-0 right-0 bg-transparent">
		<img alt="logo_3d" src={logo_3d} width="100" height="100" />
	</div>
{/if}
