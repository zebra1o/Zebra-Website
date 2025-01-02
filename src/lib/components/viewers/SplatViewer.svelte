<script lang="ts">
	import { untrack } from 'svelte';
	import * as SPLAT from 'gsplat';
	import type { ViewerProps } from '$lib/types';

	const props: ViewerProps = $props();
	const splat_state = $state({
		loading: false,
		error: null as string | null,
		renderer: null as SPLAT.WebGLRenderer | null,
		scene: null as SPLAT.Scene | null,
		camera: null as SPLAT.Camera | null,
		controls: null as SPLAT.OrbitControls | null,
		isSceneReady: false,
		isRendering: false,
		isVisible: true
	});

	let container: HTMLDivElement | null = $state(null);
	let frameId: number | null = $state(null);
	let lastFrameTime = 0;
	const targetFPS = 30;
	const frameInterval = 1000 / targetFPS;

	const handleResize = () => {
		if (!container || !splat_state.renderer) return;
		const scale = window.devicePixelRatio > 1 ? 0.75 : 1;
		const width = Math.floor(container.clientWidth * scale);
		const height = Math.floor(container.clientHeight * scale);
		splat_state.renderer.setSize(width, height);
	};

	const initGsplat = async () => {
		if (!container || !props.modelUrl) return;

		try {
			// Initialize scene and renderer with default settings
			splat_state.scene = new SPLAT.Scene();
			splat_state.camera = new SPLAT.Camera();
			splat_state.renderer = new SPLAT.WebGLRenderer();

			// Set initial size
			const scale = window.devicePixelRatio > 1 ? 0.75 : 1;
			const width = Math.floor(container.clientWidth * scale);
			const height = Math.floor(container.clientHeight * scale);
			splat_state.renderer.setSize(width, height);

			// Make background transparent
			splat_state.renderer.canvas.style.background = 'transparent';
			container.appendChild(splat_state.renderer.canvas);

			// Configure controls
			splat_state.controls = new SPLAT.OrbitControls(
				splat_state.camera,
				splat_state.renderer.canvas
			);

			// Load the splat data
			await SPLAT.Loader.LoadAsync(props.modelUrl, splat_state.scene, (progress) => {
				if (progress === 1) {
					splat_state.isSceneReady = true;
				}
			});

			if (splat_state.isSceneReady) {
				splat_state.isRendering = true;
				startRenderLoop();
			}
		} catch (error) {
			console.error('Failed to initialize gsplat:', error);
			splat_state.error = 'Failed to load splat data';
		}
	};

	const startRenderLoop = () => {
		let previousFrame = 0;
		const frame = (currentTime: number) => {
			if (
				splat_state.controls &&
				splat_state.renderer &&
				splat_state.scene &&
				splat_state.camera &&
				splat_state.isSceneReady &&
				splat_state.isRendering &&
				splat_state.isVisible
			) {
				// FPS limiting
				const deltaTime = currentTime - previousFrame;
				if (deltaTime < frameInterval) {
					frameId = requestAnimationFrame(frame);
					return;
				}

				previousFrame = currentTime - (deltaTime % frameInterval);

				try {
					splat_state.controls.update();
					splat_state.renderer.render(splat_state.scene, splat_state.camera);
				} catch (error) {
					console.error('Render error:', error);
					// Attempt recovery
					if (splat_state.renderer) {
						splat_state.renderer.render(splat_state.scene, splat_state.camera);
					}
				}

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
			try {
				const gl = splat_state.renderer.canvas.getContext('webgl2');
				if (gl) {
					gl.getExtension('WEBGL_lose_context')?.loseContext();
				}
			} catch (error) {
				console.error('Error during cleanup:', error);
			}

			splat_state.renderer.canvas.remove();
			splat_state.renderer = null;
		}

		if (splat_state.scene) {
			splat_state.scene.reset();
			splat_state.scene = null;
		}

		splat_state.controls = null;
		splat_state.camera = null;
	}

	$effect(() => {
		if (!container) return;

		untrack(async () => {
			if (!container) return;
			splat_state.loading = true;

			try {
				await initGsplat();

				const observer = new IntersectionObserver(
					(entries) => {
						entries.forEach((entry) => {
							splat_state.isVisible = entry.isIntersecting;
							if (!entry.isIntersecting) {
								splat_state.isRendering = false;
							} else {
								splat_state.isRendering = true;
								if (!frameId) {
									startRenderLoop();
								}
							}
						});
					},
					{ threshold: 0.01 }
				);

				observer.observe(container);

				const resizeObserver = new ResizeObserver(
					debounce(() => {
						handleResize();
					}, 250)
				);

				resizeObserver.observe(container);

				return () => {
					observer.disconnect();
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

	function debounce(fn: () => void, wait: number) {
		let timeout: ReturnType<typeof setTimeout>;
		return () => {
			clearTimeout(timeout);
			timeout = setTimeout(() => fn(), wait);
		};
	}
</script>

<div class="relative h-full w-full" bind:this={container}>
	{#if splat_state.loading}
		<div class="absolute inset-0 z-10 flex items-center justify-center bg-transparent">
			<div class="text-white">Loading...</div>
		</div>
	{/if}
	{#if splat_state.error}
		<div class="absolute inset-0 z-10 flex items-center justify-center bg-transparent">
			<div class="text-red-500">{splat_state.error}</div>
		</div>
	{/if}
</div>

<style>
	:global(canvas) {
		background: transparent !important;
	}
</style>
