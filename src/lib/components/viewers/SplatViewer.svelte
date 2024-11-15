<script lang="ts">
	import { untrack } from 'svelte';
	import * as SPLAT from 'gsplat';
	import type { ViewerProps } from '$lib/types/viewer.types';

	const props: ViewerProps = $props();
	const splat_state = $state({
		loading: false,
		error: null as string | null,
		renderer: null as SPLAT.WebGLRenderer | null,
		scene: null as SPLAT.Scene | null,
		camera: null as SPLAT.Camera | null,
		controls: null as SPLAT.OrbitControls | null,
		isSceneReady: false,
		isRendering: false
	});

	let container: HTMLDivElement | null = $state(null);
	let frameId: number | null = $state(null);

	const handleResize = () => {
		if (!container || !splat_state.renderer) return;
		splat_state.renderer.setSize(container.clientWidth, container.clientHeight);
	};

	const initGsplat = async () => {
		if (!container || !props.modelUrl) return;

		try {
			// Initialize scene and renderer
			splat_state.scene = new SPLAT.Scene();
			splat_state.camera = new SPLAT.Camera();
			splat_state.renderer = new SPLAT.WebGLRenderer();
			splat_state.controls = new SPLAT.OrbitControls(
				splat_state.camera,
				splat_state.renderer.canvas
			);

			// Set initial size
			handleResize();
			container.appendChild(splat_state.renderer.canvas);

			// Load the splat data and wait for it to complete
			await SPLAT.Loader.LoadAsync(props.modelUrl, splat_state.scene, (progress) => {
				if (progress === 1) {
					splat_state.isSceneReady = true;
				}
			});

			// Start rendering only after data is loaded
			if (splat_state.isSceneReady) {
				splat_state.isRendering = true;
				startRenderLoop();
			}
		} catch (error) {
			console.error('Failed to initialize gsplat:', error);
			throw new Error('Failed to load splat data');
		}
	};

	const startRenderLoop = () => {
		const frame = () => {
			if (
				splat_state.controls &&
				splat_state.renderer &&
				splat_state.scene &&
				splat_state.camera &&
				splat_state.isSceneReady &&
				splat_state.isRendering
			) {
				splat_state.controls.update();
				splat_state.renderer.render(splat_state.scene, splat_state.camera);
				frameId = requestAnimationFrame(frame);
			}
		};
		frameId = requestAnimationFrame(frame);
	};

	function cleanupSplat() {
		splat_state.isRendering = false;
		splat_state.isSceneReady = false;

		if (frameId) {
			cancelAnimationFrame(frameId);
			frameId = null;
		}

		if (splat_state.renderer) {
			splat_state.renderer.dispose();
			// Force WebGL context loss
			const gl = splat_state.renderer.canvas.getContext('webgl2');
			if (gl) {
				gl.getExtension('WEBGL_lose_context')?.loseContext();
			}
			splat_state.renderer.canvas.remove();
			splat_state.renderer = null;
		}

		if (splat_state.controls) {
			splat_state.controls.dispose();
			splat_state.controls = null;
		}

		if (splat_state.scene) {
			splat_state.scene.reset();
			splat_state.scene = null;
		}

		splat_state.camera = null;
	}

	// Handle scene setup
	$effect(() => {
		if (!container) return;

		untrack(async () => {
			if (!container) return;
			splat_state.loading = true;
			splat_state.error = null;

			try {
				await initGsplat();

				const resizeObserver = new ResizeObserver(handleResize);
				resizeObserver.observe(container);

				return () => {
					resizeObserver.disconnect();
					cleanupSplat();
				};
			} catch (error) {
				splat_state.error = error instanceof Error ? error.message : 'Failed to load splat';
			} finally {
				splat_state.loading = false;
			}
		});
	});
</script>

<div class="relative h-full w-full" bind:this={container}>
	{#if splat_state.loading}
		<div class="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
			<div class="text-gray-600">Loading...</div>
		</div>
	{/if}
	{#if splat_state.error}
		<div class="absolute inset-0 z-10 flex items-center justify-center bg-red-50">
			<div class="text-red-600">{splat_state.error}</div>
		</div>
	{/if}
</div>
