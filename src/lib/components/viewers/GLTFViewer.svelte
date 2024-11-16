<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
	import type { ViewerProps } from '$lib/types/viewer.types';

	const props: ViewerProps = $props();
	const state = $state({
		loading: false,
		error: null as string | null,
		isVisible: true,
		renderer: null as THREE.WebGLRenderer | null
	});

	let container: HTMLDivElement;
	let frameId: number;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let controls: OrbitControls;

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

		// Balanced renderer settings
		const renderer = new THREE.WebGLRenderer({
			antialias: window.devicePixelRatio < 2, // Enable only for non-high-DPI displays
			alpha: true,
			powerPreference: 'default',
			precision: 'highp',
			stencil: false,
			depth: true
		});

		renderer.setSize(container.clientWidth, container.clientHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.ReinhardToneMapping;
		renderer.toneMappingExposure = 1.2;
		renderer.shadowMap.enabled = false;
		container.appendChild(renderer.domElement);

		// Enhanced lighting for better material showcase
		const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
		hemiLight.position.set(0, 20, 0);
		scene.add(hemiLight);

		const dirLight = new THREE.DirectionalLight(0xffffff, 3);
		dirLight.position.set(3, 10, 10);
		dirLight.castShadow = false;
		scene.add(dirLight);

		const backLight = new THREE.DirectionalLight(0xffffff, 1);
		backLight.position.set(-3, 10, -10);
		scene.add(backLight);

		controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.07;
		controls.rotateSpeed = 0.7;
		controls.panSpeed = 0.7;
		controls.zoomSpeed = 0.7;
		controls.maxPolarAngle = Math.PI / 1.5;
		controls.minPolarAngle = Math.PI / 3;
		controls.enableZoom = true;
		controls.maxDistance = 10;
		controls.minDistance = 2;
		controls.target.set(0, 0, 0);

		state.renderer = renderer;
		return { scene, camera, renderer, controls };
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

			gltf.scene.traverse((node) => {
				if (node instanceof THREE.Mesh) {
					node.frustumCulled = true;

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

			gltf.scene.position.sub(center);
			const scale = 2 / Math.max(size.x, size.y, size.z);
			gltf.scene.scale.multiplyScalar(scale);

			scene.add(gltf.scene);

			controls.target.set(0, 0, 0);
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
			scene.traverse((object) => {
				if (object instanceof THREE.Mesh) {
					if (object.geometry) {
						object.geometry.dispose();
					}
					if (object.material) {
						if (Array.isArray(object.material)) {
							object.material.forEach((material) => {
								if (material.map) material.map.dispose();
								material.dispose();
							});
						} else {
							if (object.material.map) object.material.map.dispose();
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
			state.renderer.render(scene, camera);
		}
	}

	onMount(() => {
		if (!props.modelUrl) return;

		initScene();
		loadGLTF(props.modelUrl);

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

		const resizeObserver = new ResizeObserver(
			debounce(() => {
				if (!container || !state.renderer || !camera) return;

				const width = container.clientWidth;
				const height = container.clientHeight;

				camera.aspect = width / height;
				camera.updateProjectionMatrix();
				state.renderer.setSize(width, height);
			}, 250)
		);

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
</script>

<div class="relative h-full w-full" bind:this={container}>
	{#if state.loading}
		<div class="absolute inset-0 z-10 flex items-center justify-center bg-transparent">
			<div class="text-white">Loading...</div>
		</div>
	{/if}
	{#if state.error}
		<div class="absolute inset-0 z-10 flex items-center justify-center bg-transparent">
			<div class="text-red-500">{state.error}</div>
		</div>
	{/if}
</div>
