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
		error: null as string | null
	});
	let container: HTMLDivElement;

	function initScene() {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			75,
			container.clientWidth / container.clientHeight,
			0.1,
			1000
		);
		const renderer = new THREE.WebGLRenderer({ antialias: true });

		renderer.setSize(container.clientWidth, container.clientHeight);
		container.appendChild(renderer.domElement);
		renderer.setClearColor(0x111827);

		// Lights
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(3, 10, 10);
		scene.add(directionalLight);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);

		camera.position.set(0, 2, 5);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.autoRotate = true;
		controls.autoRotateSpeed = 1;

		return { scene, camera, renderer, controls };
	}

	function loadGLTF(url: string, scene: THREE.Scene) {
		state.loading = true;

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('/draco/');

		const loader = new GLTFLoader();
		loader.setDRACOLoader(dracoLoader);

		return loader
			.loadAsync(url)
			.then((gltf) => {
				scene.add(gltf.scene);

				// Center and scale
				const box = new THREE.Box3().setFromObject(gltf.scene);
				const center = box.getCenter(new THREE.Vector3());
				const size = box.getSize(new THREE.Vector3());

				gltf.scene.position.sub(center);
				const scale = 2 / Math.max(size.x, size.y, size.z);
				gltf.scene.scale.multiplyScalar(scale);

				return gltf.scene;
			})
			.catch((error: Error) => {
				state.error = error.message;
				throw error;
			})
			.finally(() => {
				state.loading = false;
			});
	}

	function cleanupScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
		// Stop any ongoing animations first
		if (typeof window !== 'undefined') {
			window.cancelAnimationFrame(frameId);
		}

		// Dispose of geometries and materials
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

		// Clear scene
		while (scene.children.length > 0) {
			scene.remove(scene.children[0]);
		}

		// Remove the canvas from DOM before disposing
		if (renderer.domElement.parentNode) {
			renderer.domElement.parentNode.removeChild(renderer.domElement);
		}

		// Dispose of renderer without forcing context loss
		renderer.dispose();

		// Clear any references
		scene.clear();
	}

	// Add frameId to track animation frame
	let frameId: number;

	onMount(() => {
		if (!props.modelUrl) return;

		const { scene, camera, renderer, controls } = initScene();

		loadGLTF(props.modelUrl, scene).then(() => {
			controls.autoRotate = false;
		});

		function animate() {
			frameId = requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
		}
		animate();

		const resizeObserver = new ResizeObserver(() => {
			if (!container) return;
			const width = container.clientWidth;
			const height = container.clientHeight;

			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		});

		resizeObserver.observe(container);

		return () => {
			resizeObserver.disconnect();
			controls.dispose();
			cleanupScene(scene, renderer);
		};
	});
</script>

<div class="w-ful relative h-full" bind:this={container}>
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
