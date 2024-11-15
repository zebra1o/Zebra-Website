<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
	import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
	import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

	type ModelResult = {
		type: 'gltf' | 'points' | 'splat';
		object: THREE.Object3D | null;
	} | null;

	export let modelUrl: string | undefined = undefined;
	export let title: string = 'Model Viewer';
	export let description: string | undefined = undefined;
	export let height: string = '400px';

	let container: HTMLDivElement;
	let canvasContainer: HTMLDivElement;
	let loading = false;
	let error: string | null = null;
	let viewer: any = null;

	function getFileExtension(url: string): string {
		return url.split('.').pop()?.toLowerCase() || '';
	}

	function initGaussianSplats(url: string) {
		return new Promise((resolve, reject) => {
			console.log('Initializing Gaussian Splats with URL:', url);

			if (!container) {
				reject(new Error('Container element not available'));
				return;
			}

			// Set initial canvas size
			const containerWidth = container.clientWidth;
			const containerHeight = container.clientHeight;
			console.log('Container size:', containerWidth, 'x', containerHeight);

			try {
				// Create viewer with proper configuration
				viewer = new GaussianSplats3D.Viewer({
					container: canvasContainer,
					cameraUp: [0, 1, 0],
					initialCameraPosition: [-2, 2, 2],
					initialCameraLookAt: [0, 0, 0],
					backgroundColor: [0.1, 0.1, 0.1],
					// Essential features
					selfDrivenMode: true,
					useBuiltInControls: true,
					// Performance optimizations
					sharedMemoryForWorkers: false,
					gpuAcceleratedSort: false,
					integerBasedSort: true,
					halfPrecisionCovariancesOnGPU: true,
					// Progressive loading for better UX
					sceneRevealMode: GaussianSplats3D.SceneRevealMode.Gradual,
					renderMode: GaussianSplats3D.RenderMode.OnChange
				});

				console.log('Viewer created successfully');

				// Add the splat scene
				viewer
					.addSplatScene(url, {
						splatAlphaRemovalThreshold: 1,
						showLoadingUI: true,
						progressiveLoad: true
					})
					.then(() => {
						console.log('Splat scene added successfully');
						viewer.start();
						console.log('Viewer started');

						// Handle resize
						const handleResize = () => {
							if (!container || !viewer) return;
							const width = container.clientWidth;
							const height = container.clientHeight;
							console.log('Resizing to:', width, 'x', height);
						};

						window.addEventListener('resize', handleResize);

						// Return cleanup function
						resolve(() => {
							window.removeEventListener('resize', handleResize);
							if (viewer) {
								viewer.dispose();
							}
						});
					})
					.catch((error) => {
						console.error('Error adding splat scene:', error);
						reject(error);
					});
			} catch (error) {
				console.error('Error creating viewer:', error);
				reject(error);
			}
		});
	}

	function loadModel(url: string): Promise<ModelResult> {
		return new Promise((resolve, reject) => {
			if (!url) {
				resolve(null);
				return;
			}

			loading = true;
			error = null;

			const extension = getFileExtension(url);
			console.log('Loading model with extension:', extension, 'from URL:', url);

			try {
				if (['splat', 'ksplat', 'ply'].includes(extension)) {
					// Handle Gaussian Splats and PLY
					if (extension === 'ply' && !url.includes('splat')) {
						console.log('Loading as regular PLY file');
						// Regular PLY file
						const loader = new PLYLoader();
						loader.load(
							url,
							(geometry) => {
								const material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });
								const points = new THREE.Points(geometry, material);
								resolve({ type: 'points', object: points });
								loading = false;
							},
							undefined,
							(e) => {
								console.error('Error loading PLY:', e);
								error = e instanceof Error ? e.message : 'Failed to load PLY';
								loading = false;
								reject(e);
							}
						);
					} else {
						console.log('Loading as Gaussian Splat file');
						// Verify file exists by making a HEAD request
						fetch(url, { method: 'HEAD' })
							.then((response) => {
								if (!response.ok) {
									throw new Error(`File not found: ${url}`);
								}
								console.log('Splat file exists, proceeding with loading');
								loading = false;
								resolve({ type: 'splat', object: null });
							})
							.catch((error) => {
								console.error('Error checking splat file:', error);
								loading = false;
								reject(error);
							});
					}
				} else {
					console.log('Loading as GLTF/GLB');
					// Handle GLTF/GLB
					const dracoLoader = new DRACOLoader();
					dracoLoader.setDecoderPath('/draco/');

					const loader = new GLTFLoader();
					loader.setDRACOLoader(dracoLoader);

					loader.load(
						url,
						(gltf) => {
							console.log('GLB loaded successfully:', gltf);
							const scene = new THREE.Scene();
							scene.add(gltf.scene);
							resolve({ type: 'gltf', object: scene });
							loading = false;
						},
						(progress) => {
							console.log('GLB loading progress:', (progress.loaded / progress.total) * 100, '%');
						},
						(e) => {
							console.error('Error loading GLTF/GLB:', e);
							error = e instanceof Error ? e.message : 'Failed to load model';
							loading = false;
							reject(e);
						}
					);
				}
			} catch (e) {
				error = e instanceof Error ? e.message : 'Failed to load model';
				loading = false;
				console.error('Error loading model:', e);
				reject(e);
			}
		});
	}

	onMount(() => {
		if (!modelUrl) return;

		const extension = getFileExtension(modelUrl);
		if (['splat', 'ksplat'].includes(extension)) {
			loading = true;
			initGaussianSplats(modelUrl)
				.then((cleanup) => {
					loading = false;
					return cleanup;
				})
				.catch((e) => {
					error = e instanceof Error ? e.message : 'Failed to load Gaussian Splats';
					loading = false;
				});
			return;
		}

		// For other formats, use Three.js
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			75,
			container.clientWidth / container.clientHeight,
			0.1,
			1000
		);
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		
		// Set size and append to container
		renderer.setSize(container.clientWidth, container.clientHeight);
		canvasContainer.appendChild(renderer.domElement);

		renderer.setClearColor(0x111827);

		// Lights
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(3, 10, 10);
		scene.add(directionalLight);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);

		// Camera position
		camera.position.set(0, 2, 5);

		// Controls
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.autoRotate = true;
		controls.autoRotateSpeed = 1;

		// Default sphere
		const geometry = new THREE.SphereGeometry(1, 32, 32);
		const material = new THREE.MeshStandardMaterial({ color: 0x4a9eff });
		const sphere = new THREE.Mesh(geometry, material);
		scene.add(sphere);

		// Load model
		loading = true;
		loadModel(modelUrl)
			.then((result) => {
				if (result?.object && result.type !== 'splat') {
					scene.remove(sphere);
					const object = result.object;

					scene.add(object);

					// Center and scale the model
					const box = new THREE.Box3().setFromObject(object);
					const center = box.getCenter(new THREE.Vector3());
					const size = box.getSize(new THREE.Vector3());

					object.position.x = -center.x;
					object.position.y = -center.y;
					object.position.z = -center.z;

					const maxDim = Math.max(size.x, size.y, size.z);
					const scale = 2 / maxDim;
					object.scale.multiplyScalar(scale);

					controls.autoRotate = false;
				}
			})
			.catch((e) => {
				error = e instanceof Error ? e.message : 'Failed to load model';
			})
			.finally(() => {
				loading = false;
			});

		// Animation loop
		function animate() {
			requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
		}
		animate();

		// Handle resize
		function handleResize() {
			if (!container) return;
			const width = container.clientWidth;
			const height = container.clientHeight;
			
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		}

		const resizeObserver = new ResizeObserver(handleResize);
		resizeObserver.observe(container);

		return () => {
			resizeObserver.disconnect();
			renderer.dispose();
			controls.dispose();
		};
	});
</script>

<div class="relative h-full w-full overflow-hidden rounded-lg bg-white shadow" bind:this={container}>
	<div class="p-4">
		<h3 class="text-lg font-medium text-gray-900">{title}</h3>
		{#if description}
			<p class="mt-1 text-sm text-gray-500">{description}</p>
		{/if}
	</div>
	<div class="relative w-full" style="height: {height};" bind:this={canvasContainer}>
		{#if loading}
			<div class="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
				<div class="text-gray-600">Loading...</div>
			</div>
		{/if}
		{#if error}
			<div class="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
				<div class="text-red-600">{error}</div>
			</div>
		{/if}
	</div>
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
