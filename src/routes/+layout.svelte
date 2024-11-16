<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Zebra Portfolio</title>
	<meta name="description" content="Zebra Portfolio" />
	<meta name="author" content="Zebra" />
	<meta property="og:title" content="Zebra Portfolio" />
	<meta property="og:description" content="Zebra Portfolio" />
	<meta property="og:image" content="/icons/android-icon-192x192.png" />
</svelte:head>

<div class="h-screen w-screen bg-black text-white">
	{@render children()}
</div>
