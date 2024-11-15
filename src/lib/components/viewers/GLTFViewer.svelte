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

	onMount(() => {
		if (!props.modelUrl) return;

		const { scene, camera, renderer, controls } = initScene();

		loadGLTF(props.modelUrl, scene).then(() => {
			controls.autoRotate = false;
		});

		function animate() {
			requestAnimationFrame(animate);
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
			renderer.dispose();
			controls.dispose();
		};
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
