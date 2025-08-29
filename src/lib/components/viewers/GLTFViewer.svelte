<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
	import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
	import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
	import type { ViewerProps } from '$lib/types';
	import { viewerSettings } from '$lib/stores/viewer-settings';
	import { materialPresets, qualityPresets } from '$lib/stores/quality-presets';
	import Loader from '../Loader.svelte';
	import { PressedKeys } from 'runed';
	import { useEventListener } from 'runed';

	const props: ViewerProps = $props();
	const keys = new PressedKeys();
	const isLightControlActive = $derived(keys.has('l'));
	const state = $state({
		loading: false,
		error: null as string | null,
		isVisible: true,
		renderer: null as THREE.WebGLRenderer | null,
		composer: null as EffectComposer | null,
		bloomPass: null as UnrealBloomPass | null,
		lightGroup: null as THREE.Group | null,
		lights: null as {
			key: THREE.PointLight;
			fill: THREE.PointLight;
			rim: THREE.PointLight;
		} | null,
		lightHelpers: [] as THREE.PointLightHelper[],
		lightRadius: 5
	});

	let container: HTMLDivElement;
	let frameId: number;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let controls: OrbitControls;

	function setupLights() {
		const currentQuality = qualityPresets[$viewerSettings.global.qualityPreset];
		const lightGroup = new THREE.Group();

		const lights = {
			key: new THREE.PointLight(
				$viewerSettings.lights.key.color,
				$viewerSettings.lights.key.intensity * $viewerSettings.global.lightIntensity,
				$viewerSettings.lights.key.distance * 5,
				1.0
			),
			fill: new THREE.PointLight(
				$viewerSettings.lights.fill.color,
				$viewerSettings.lights.fill.intensity * $viewerSettings.global.lightIntensity,
				$viewerSettings.lights.fill.distance * 5,
				1.0
			),
			rim: new THREE.PointLight(
				$viewerSettings.lights.rim.color,
				$viewerSettings.lights.rim.intensity * $viewerSettings.global.lightIntensity,
				$viewerSettings.lights.rim.distance * 5,
				1.0
			)
		};

		// Position lights based on settings
		Object.entries(lights).forEach(([type, light], index) => {
			// Skip rim light in low quality mode
			if (currentQuality.lights.maxLights === 2 && type === 'rim') {
				return;
			}

			const settings = $viewerSettings.lights[type as keyof typeof $viewerSettings.lights];

			// Apply quality-specific shadow settings
			light.castShadow = $viewerSettings.global.shadows && currentQuality.meshes.castShadow;
			if (light.castShadow) {
				light.shadow.bias = currentQuality.lights.shadowBias;
				light.shadow.radius = currentQuality.lights.shadowRadius;
				light.shadow.mapSize.width = currentQuality.renderer.shadowMap.mapSize;
				light.shadow.mapSize.height = currentQuality.renderer.shadowMap.mapSize;
			}

			const pos = new THREE.Vector3(
				settings.position.x,
				settings.position.y,
				settings.position.z
			).normalize();

			light.position.copy(
				pos.multiplyScalar(settings.distance * $viewerSettings.global.centerDistance * 0.5)
			);

			lightGroup.add(light);
			const helper = new THREE.PointLightHelper(light, 0.5);
			helper.visible = $viewerSettings.global.showHelpers;
			state.lightHelpers.push(helper);
			scene.add(helper);
		});

		state.lightGroup = lightGroup;
		state.lights = lights;
		scene.add(lightGroup);
	}

	// Update light settings when store changes
	$effect(() => {
		if (!state.lights) return;

		const { lights: storeLights, global } = $viewerSettings;

		// Update light properties
		Object.entries(state.lights).forEach(([type, light]) => {
			const settings = storeLights[type as keyof typeof storeLights];

			// Update intensity with global multiplier
			light.intensity = settings.intensity * global.lightIntensity;
			light.color.set(settings.color);
			(light as THREE.PointLight).distance = settings.distance * 5;

			// Update shadow settings
			light.castShadow = global.shadows;
			if (light.castShadow) {
				light.shadow.bias = -0.001;
				light.shadow.mapSize.width = 512;
				light.shadow.mapSize.height = 512;
			}

			// Apply individual light settings
			const pos = new THREE.Vector3(
				settings.position.x,
				settings.position.y,
				settings.position.z
			).normalize();

			// Set light position based on direction and distance, scaled by center distance
			light.position.copy(pos.multiplyScalar(settings.distance * global.centerDistance * 0.5));
		});

		// Update helpers
		state.lightHelpers.forEach((helper) => {
			helper.visible = global.showHelpers;
			helper.update();
		});
	});

	function initPostProcessing() {
		if (!state.renderer || !container) return;

		const currentQuality = qualityPresets[$viewerSettings.global.qualityPreset];

		// Only initialize if post-processing is enabled for current quality preset
		if (!currentQuality.postProcessing.enabled) {
			state.composer = null;
			state.bloomPass = null;
			return;
		}

		// Ensure we have valid dimensions
		const width = Math.max(1, container.clientWidth);
		const height = Math.max(1, container.clientHeight);
		const pixelRatio = currentQuality.renderer.pixelRatio;

		// Create render target with proper settings
		const renderTarget = new THREE.WebGLRenderTarget(
			Math.floor(width * pixelRatio),
			Math.floor(height * pixelRatio),
			{
				type: THREE.HalfFloatType,
				format: THREE.RGBAFormat,
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				stencilBuffer: false,
				depthBuffer: true,
				samples: currentQuality.postProcessing.samples
			}
		);

		// Setup composer with render target
		const composer = new EffectComposer(state.renderer, renderTarget);
		composer.setSize(width, height);
		composer.setPixelRatio(pixelRatio);

		// Add render pass
		const renderPass = new RenderPass(scene, camera);
		composer.addPass(renderPass);

		// Add bloom pass with quality-specific parameters
		if (currentQuality.postProcessing.bloom) {
			const bloomPass = new UnrealBloomPass(
				new THREE.Vector2(width, height),
				currentQuality.postProcessing.bloom.strength,
				currentQuality.postProcessing.bloom.radius,
				currentQuality.postProcessing.bloom.threshold
			);
			bloomPass.enabled = $viewerSettings.global.bloom;
			composer.addPass(bloomPass);
			state.bloomPass = bloomPass;
		}

		state.composer = composer;
	}

	function initScene() {
		scene = new THREE.Scene();
		scene.background = null;

		camera = new THREE.PerspectiveCamera(
			50,
			container.clientWidth / container.clientHeight,
			0.1,
			1000
		);
		camera.position.set(0, 0, 5);

		const currentQuality = qualityPresets[$viewerSettings.global.qualityPreset];

		// Setup renderer with quality settings
		const renderer = new THREE.WebGLRenderer({
			antialias: currentQuality.renderer.antialias,
			alpha: true,
			powerPreference: currentQuality.renderer.powerPreference,
			precision: currentQuality.renderer.precision,
			stencil: false,
			depth: true,
			failIfMajorPerformanceCaveat: true
		});

		renderer.setSize(container.clientWidth, container.clientHeight);
		renderer.setPixelRatio(currentQuality.renderer.pixelRatio);
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.5;
		renderer.shadowMap.enabled = $viewerSettings.global.shadows;
		renderer.shadowMap.type = currentQuality.renderer.shadowMap.type;
		container.appendChild(renderer.domElement);

		state.renderer = renderer;

		// Setup lights first (needed for post-processing)
		setupLights();

		// Setup post-processing
		initPostProcessing();

		// Setup controls
		controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.rotateSpeed = 1.0;
		controls.panSpeed = 1.0;
		controls.zoomSpeed = 1.2;
		controls.maxPolarAngle = Math.PI;
		controls.minPolarAngle = 0;
		controls.enableZoom = true;
		controls.maxDistance = 20;
		controls.minDistance = 1;
		controls.enablePan = true;
		controls.screenSpacePanning = true;
		controls.target.set(0, 0, 0);
	}

	async function loadGLTF(url: string) {
		state.loading = true;

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('/draco/');
		dracoLoader.setDecoderConfig({ type: 'js' });

		const loader = new GLTFLoader();
		loader.setDRACOLoader(dracoLoader);

		try {
			const gltf = await loader.loadAsync(url);

			gltf.scene.traverse((node: THREE.Object3D) => {
				if (node instanceof THREE.Mesh) {
					node.frustumCulled = true;
					node.castShadow = $viewerSettings.global.shadows;
					node.receiveShadow = $viewerSettings.global.shadows;

					if (node.geometry) {
						node.geometry.computeBoundingSphere();
						node.geometry.computeBoundingBox();
					}

					// Enhanced material handling
					if (Array.isArray(node.material)) {
						node.material.forEach(optimizeMaterial);
					} else {
						optimizeMaterial(node.material);
					}
				}
			});

			// Center and scale model
			const box = new THREE.Box3().setFromObject(gltf.scene);
			const center = box.getCenter(new THREE.Vector3());
			const size = box.getSize(new THREE.Vector3());
			const maxDim = Math.max(size.x, size.y, size.z);

			// Center the model
			gltf.scene.position.sub(center);

			// Scale model to a larger size (8 units)
			// const scale = 8 / maxDim;
			// gltf.scene.scale.multiplyScalar(scale);

			scene.add(gltf.scene);

			// Set initial camera position based on model size
			// const initialDistance = maxDim * scale * 1.5;
			camera.position.set(maxDim, maxDim * 0.5, maxDim);
			controls.target.set(0, 0, 0);

			// Set control limits based on model size
			controls.maxDistance = maxDim * 3;
			controls.minDistance = maxDim * 0.2;
			controls.update();
		} catch (error) {
			state.error = error instanceof Error ? error.message : 'Failed to load model';
			throw error;
		} finally {
			state.loading = false;
			dracoLoader.dispose();
		}
	}

	function optimizeMaterial(material: THREE.Material) {
		if (material instanceof THREE.MeshStandardMaterial) {
			// Preserve original material properties if they exist
			material.side = THREE.FrontSide;
			material.roughness = material.roughness || 0.8;
			material.metalness = material.metalness || 0.2;
			material.envMapIntensity = 1;
			material.depthWrite = true;

			// Keep original maps if they exist
			if (material.map) {
				material.map.anisotropy = 4;
				material.map.minFilter = THREE.LinearMipmapLinearFilter;
				material.map.magFilter = THREE.LinearFilter;
			}

			if (material.normalMap) {
				material.normalMap.minFilter = THREE.LinearMipmapLinearFilter;
				material.normalMap.magFilter = THREE.LinearFilter;
			}

			material.needsUpdate = true;
		}
	}

	function cleanupScene() {
		if (frameId) {
			cancelAnimationFrame(frameId);
		}

		if (scene) {
			scene.traverse((object: THREE.Object3D) => {
				if (object instanceof THREE.Mesh) {
					if (object.geometry) {
						object.geometry.dispose();
					}
					if (object.material) {
						if (Array.isArray(object.material)) {
							object.material.forEach((material: THREE.Material) => {
								if ((material as any).map) (material as any).map.dispose();
								material.dispose();
							});
						} else {
							if ((object.material as any).map) (object.material as any).map.dispose();
							object.material.dispose();
						}
					}
				}
			});
			scene.clear();
		}

		if (state.renderer) {
			state.renderer.dispose();
			state.renderer.forceContextLoss();
			state.renderer = null;
		}

		if (controls) {
			controls.dispose();
		}
	}

	let observer: IntersectionObserver;
	let animating = true;

	function animate() {
		if (!animating || !state.renderer) return;

		frameId = requestAnimationFrame(animate);

		if (state.isVisible) {
			controls.update();

			// Update light helpers
			if (isLightControlActive || $viewerSettings.global.showHelpers) {
				state.lightHelpers.forEach((helper) => helper.update());
			}

			// Use composer for rendering if bloom is enabled
			if (state.composer && $viewerSettings.global.bloom) {
				state.composer.render();
			} else {
				state.renderer.render(scene, camera);
			}
		}
	}

	// Handle light group movement
	useEventListener(window, 'mousemove', (e: MouseEvent) => {
		if (!isLightControlActive || !state.lightGroup) return;

		const rect = container.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
		const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

		// Rotate entire light group
		const theta = x * Math.PI;
		const phi = (y * Math.PI) / 2;

		state.lightGroup.rotation.y = theta;
		state.lightGroup.rotation.x = phi;
	});

	// Toggle light helpers based on control state
	$effect(() => {
		if (!scene) return;

		if (isLightControlActive) {
			state.lightHelpers.forEach((helper) => scene.add(helper));
		} else {
			state.lightHelpers.forEach((helper) => scene.remove(helper));
		}
	});

	// Update post-processing settings when store changes
	$effect(() => {
		if (!state.bloomPass) return;
		state.bloomPass.enabled = $viewerSettings.global.bloom;
	});

	// Update shadow settings when shadow toggle changes
	$effect(() => {
		if (!state.renderer || !scene) return;

		state.renderer.shadowMap.enabled = $viewerSettings.global.shadows;

		// Update all meshes in the scene
		scene.traverse((node: THREE.Object3D) => {
			if (node instanceof THREE.Mesh) {
				node.castShadow = $viewerSettings.global.shadows;
				node.receiveShadow = $viewerSettings.global.shadows;
			}
		});

		// Update all lights
		if (state.lights) {
			Object.values(state.lights).forEach((light) => {
				light.castShadow = $viewerSettings.global.shadows;
			});
		}
	});

	// Handle resize
	function handleResize() {
		if (!state.renderer || !container) return;

		const width = Math.max(1, container.clientWidth);
		const height = Math.max(1, container.clientHeight);

		// Update camera
		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		// Update renderer
		state.renderer.setSize(width, height);
		state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// Update composer and passes
		if (state.composer) {
			state.composer.setSize(width, height);
			if (state.bloomPass) {
				state.bloomPass.resolution.set(width, height);
			}
		}
	}

	function applyAllSettings() {
		if (!scene || !state.renderer) return;

		const currentQuality = qualityPresets[$viewerSettings.global.qualityPreset];

		// Update renderer settings
		state.renderer.setPixelRatio(currentQuality.renderer.pixelRatio);
		if (state.renderer.shadowMap.type !== currentQuality.renderer.shadowMap.type) {
			state.renderer.shadowMap.type = currentQuality.renderer.shadowMap.type;
			state.renderer.shadowMap.needsUpdate = true;
		}
		state.renderer.shadowMap.enabled = $viewerSettings.global.shadows;

		// Update post-processing
		initPostProcessing();

		// Update all meshes in the scene
		scene.traverse((node: THREE.Object3D) => {
			if (node instanceof THREE.Mesh) {
				node.castShadow = $viewerSettings.global.shadows && currentQuality.meshes.castShadow;
				node.receiveShadow = $viewerSettings.global.shadows && currentQuality.meshes.receiveShadow;
				node.frustumCulled = currentQuality.meshes.frustumCulled;

				// Update material preset
				const preset = materialPresets[$viewerSettings.global.materialPreset];
				if (Array.isArray(node.material)) {
					node.material.forEach((mat: THREE.Material) => {
						if (mat instanceof THREE.MeshStandardMaterial) {
							mat.roughness = preset.roughness;
							mat.metalness = preset.metalness;
							mat.envMapIntensity = preset.envMapIntensity;
							if ('transparent' in preset) (mat as any).transparent = preset.transparent;
							if ('opacity' in preset) (mat as any).opacity = preset.opacity;
							mat.needsUpdate = true;
						}
					});
				} else if (node.material instanceof THREE.MeshStandardMaterial) {
					node.material.roughness = preset.roughness;
					node.material.metalness = preset.metalness;
					node.material.envMapIntensity = preset.envMapIntensity;
					if ('transparent' in preset) (node.material as any).transparent = preset.transparent;
					if ('opacity' in preset) (node.material as any).opacity = preset.opacity;
					node.material.needsUpdate = true;
				}
			}
		});

		// Update lights
		if (state.lights) {
			Object.entries(state.lights).forEach(([type, light], index) => {
				// Handle rim light visibility in low quality mode
				if (currentQuality.lights.maxLights === 2 && type === 'rim') {
					light.intensity = 0;
					return;
				}

				const settings = $viewerSettings.lights[type as keyof typeof $viewerSettings.lights];
				light.intensity = settings.intensity * $viewerSettings.global.lightIntensity;
				light.color.set(settings.color);
				(light as THREE.PointLight).distance = settings.distance * 5;
				light.castShadow = $viewerSettings.global.shadows;
				if (light.castShadow) {
					light.shadow.bias = currentQuality.lights.shadowBias;
					light.shadow.radius = currentQuality.lights.shadowRadius;
					light.shadow.mapSize.width = currentQuality.renderer.shadowMap.mapSize;
					light.shadow.mapSize.height = currentQuality.renderer.shadowMap.mapSize;
					light.shadow.needsUpdate = true;
				}
				const pos = new THREE.Vector3(
					settings.position.x,
					settings.position.y,
					settings.position.z
				).normalize();
				light.position.copy(
					pos.multiplyScalar(settings.distance * $viewerSettings.global.centerDistance * 0.5)
				);
			});
		}

		// Update helpers
		state.lightHelpers.forEach((helper) => {
			helper.visible = $viewerSettings.global.showHelpers;
			helper.update();
		});

		// Update bloom pass
		if (state.bloomPass) {
			state.bloomPass.enabled = $viewerSettings.global.bloom;
		}
	}

	onMount(() => {
		$viewerSettings.visible = false;
		if (!props.modelUrl) return;

		initScene();
		loadGLTF(props.modelUrl).then(() => {
			applyAllSettings();
		});

		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					state.isVisible = entry.isIntersecting;
				});
			},
			{ threshold: 0.1 }
		);

		observer.observe(container);
		animate();

		// Use ResizeObserver instead of debounced function
		const resizeObserver = new ResizeObserver(() => {
			if (!container || !state.renderer || !camera) return;
			handleResize();
		});

		resizeObserver.observe(container);

		return () => {
			animating = false;
			observer.disconnect();
			resizeObserver.disconnect();
			cleanupScene();
		};
	});

	function debounce(fn: () => void, wait: number) {
		let timeout: ReturnType<typeof setTimeout>;
		return () => {
			clearTimeout(timeout);
			timeout = setTimeout(() => fn(), wait);
		};
	}

	onDestroy(() => {
		state.lightHelpers.forEach((helper) => {
			scene.remove(helper);
			helper.dispose();
		});

		if (state.lightGroup) {
			scene.remove(state.lightGroup);
		}
	});

	// Add quality preset change effect
	$effect(() => {
		if (!state.renderer || !scene) return;

		const currentQuality = qualityPresets[$viewerSettings.global.qualityPreset];

		// Update renderer settings
		state.renderer.setPixelRatio(currentQuality.renderer.pixelRatio);
		if (state.renderer.shadowMap.type !== currentQuality.renderer.shadowMap.type) {
			state.renderer.shadowMap.type = currentQuality.renderer.shadowMap.type;
			state.renderer.shadowMap.needsUpdate = true;
		}

		// Update post-processing
		initPostProcessing();

		// Update all meshes in the scene
		scene.traverse((node: THREE.Object3D) => {
			if (node instanceof THREE.Mesh) {
				node.castShadow = $viewerSettings.global.shadows && currentQuality.meshes.castShadow;
				node.receiveShadow = $viewerSettings.global.shadows && currentQuality.meshes.receiveShadow;
				node.frustumCulled = currentQuality.meshes.frustumCulled;
			}
		});

		// Update lights
		if (state.lights) {
			Object.entries(state.lights).forEach(([type, light], index) => {
				// Handle rim light visibility in low quality mode
				if (currentQuality.lights.maxLights === 2 && type === 'rim') {
					light.intensity = 0;
					return;
				}

				if (light.castShadow) {
					light.shadow.bias = currentQuality.lights.shadowBias;
					light.shadow.radius = currentQuality.lights.shadowRadius;
					light.shadow.mapSize.width = currentQuality.renderer.shadowMap.mapSize;
					light.shadow.mapSize.height = currentQuality.renderer.shadowMap.mapSize;
					light.shadow.needsUpdate = true;
				}
			});
		}
	});

	// Update materials when material preset changes
	$effect(() => {
		if (!scene) return;

		const preset = materialPresets[$viewerSettings.global.materialPreset];
		scene.traverse((node: THREE.Object3D) => {
			if (node instanceof THREE.Mesh) {
				if (Array.isArray(node.material)) {
					node.material.forEach((mat: THREE.Material) => {
						if (mat instanceof THREE.MeshStandardMaterial) {
							mat.roughness = preset.roughness;
							mat.metalness = preset.metalness;
							mat.envMapIntensity = preset.envMapIntensity;
							if ('transparent' in preset) (mat as any).transparent = preset.transparent;
							if ('opacity' in preset) (mat as any).opacity = preset.opacity;
							mat.needsUpdate = true;
						}
					});
				} else if (node.material instanceof THREE.MeshStandardMaterial) {
					node.material.roughness = preset.roughness;
					node.material.metalness = preset.metalness;
					node.material.envMapIntensity = preset.envMapIntensity;
					if ('transparent' in preset) (node.material as any).transparent = preset.transparent;
					if ('opacity' in preset) (node.material as any).opacity = preset.opacity;
					node.material.needsUpdate = true;
				}
			}
		});
	});
</script>

<div class="relative h-full w-full" bind:this={container}>
	{#if state.loading}
		<div class="absolute inset-0 z-10 flex items-center justify-center bg-transparent">
			<Loader />
		</div>
	{/if}
	{#if state.error}
		<div class="absolute inset-0 z-10 flex items-center justify-center bg-transparent">
			<div class="text-red-500">{state.error}</div>
		</div>
	{/if}
</div>
