<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
	import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
	import type { ViewerProps } from '$lib/types/viewer.types';

	const props: ViewerProps = $props();
	const state = $state({
		loading: false,
		error: null as string | null,
		viewer: null as GaussianSplats3D.Viewer | null
	});

	let container: HTMLDivElement;

	async function initSplatViewer() {
		if (!container || !props.modelUrl) throw new Error('Container or model URL not available');

		const isSharedArrayBufferAvailable = (() => {
			try {
				return (
					typeof SharedArrayBuffer !== 'undefined' &&
					typeof crossOriginIsolated !== 'undefined' &&
					crossOriginIsolated === true
				);
			} catch {
				return false;
			}
		})();

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(container.clientWidth, container.clientHeight);
		container.appendChild(renderer.domElement);
		renderer.setClearColor(0x111827);

		const camera = new THREE.PerspectiveCamera(
			65,
			container.clientWidth / container.clientHeight,
			0.1,
			500
		);
		camera.position.set(-2, 2, 2);
		camera.lookAt(0, 0, 0);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const viewer = new GaussianSplats3D.Viewer({
			selfDrivenMode: false,
			container: container,
			renderer: renderer,
			camera: camera,
			useBuiltInControls: false,
			gpuAcceleratedSort: isSharedArrayBufferAvailable,
			sharedMemoryForWorkers: isSharedArrayBufferAvailable,
			integerBasedSort: true,
			halfPrecisionCovariancesOnGPU: true,
			dynamicScene: false,
			renderMode: GaussianSplats3D.RenderMode.OnChange,
			sceneRevealMode: GaussianSplats3D.SceneRevealMode.Instant
		});

		await viewer.addSplatScene(props.modelUrl, {
			splatAlphaRemovalThreshold: 1,
			showLoadingUI: true,
			progressiveLoad: true
		});

		return { viewer, controls, renderer };
	}

	// Handle scene setup and animation
	$effect(() => {
		if (!container) return;

		untrack(async () => {
			state.loading = true;
			state.error = null;

			try {
				const { viewer, controls, renderer } = await initSplatViewer();
				state.viewer = viewer;

				function animate() {
					requestAnimationFrame(animate);
					controls.update();
					if (viewer) {
						viewer.update();
						viewer.render();
					}
				}
				animate();

				// Handle resize
				const resizeObserver = new ResizeObserver(() => {
					if (!container || !viewer || !renderer) return;
					const width = container.clientWidth;
					const height = container.clientHeight;
					renderer.setSize(width, height);
				});

				resizeObserver.observe(container);

				return () => {
					resizeObserver.disconnect();
					if (viewer) viewer.dispose();
					controls.dispose();
					renderer.dispose();
				};
			} catch (error) {
				state.error = error instanceof Error ? error.message : 'Failed to load splat';
			} finally {
				state.loading = false;
			}
		});
	});
</script>

<div class="relative w-full" style="height: {props.height}" bind:this={container}>
	{#if state.loading}
		<div class="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
			<div class="text-gray-600">Loading...</div>
		</div>
	{/if}
	{#if state.error}
		<div class="absolute inset-0 z-10 flex items-center justify-center bg-red-50">
			<div class="text-red-600">{state.error}</div>
		</div>
	{/if}
</div>

<style>
	:global(canvas) {
		width: 100% !important;
		height: 100% !important;
	}

	:global(.progressBarOuterContainer),
	:global(.spinnerOuterContainer0) {
		z-index: 20 !important;
	}

	:global(.progressBarBox),
	:global(.spinnerContainerPrimary0) {
		z-index: 30 !important;
	}
</style>
