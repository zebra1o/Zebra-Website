<script lang="ts">
	import ThreeViewer from '$lib/components/ThreeViewer.svelte';
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">3D Model Viewer</h1>

	<div class="grid gap-6 md:grid-cols-2">
		<ThreeViewer
			title="GLB Model"
			description="A GLB model with DRACO compression"
			height="400px"
			modelUrl="/models/bocciolo_metallic.glb"
		/>

		<ThreeViewer
			title="Gaussian Splat"
			description="A Gaussian Splat visualization"
			height="400px"
			modelUrl="/models/cactino.splat"
		/>
	</div>

	<div class="mt-6 text-sm text-gray-600">
		<h2 class="font-semibold">Supported Formats:</h2>
		<ul class="mt-2 list-inside list-disc">
			<li>GLB/GLTF models (with DRACO compression support)</li>
			<li>Gaussian Splats (.splat, .ksplat)</li>
			<li>PLY point clouds</li>
		</ul>
	</div>
</div>
