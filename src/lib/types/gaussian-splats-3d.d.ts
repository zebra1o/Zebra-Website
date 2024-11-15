declare module '@mkkellogg/gaussian-splats-3d' {
	import * as THREE from 'three';

	export class Viewer {
		constructor(options: ViewerOptions);
		addSplatScene(url: string, options?: SplatSceneOptions): Promise<void>;
		start(): void;
		dispose(): void;
		setSize(width: number, height: number): void;
		update(): void;
		render(): void;
	}

	export class DropInViewer extends THREE.Object3D {
		constructor(options: DropInViewerOptions);
		addSplatScene(url: string, options: SplatSceneOptions): Promise<void>;
		renderSplats(): void;
		dispose(): void;
	}

	export enum SceneRevealMode {
		Default = 'DEFAULT',
		Gradual = 'GRADUAL',
		Instant = 'INSTANT'
	}

	export enum RenderMode {
		Always = 'ALWAYS',
		OnChange = 'ON_CHANGE',
		Never = 'NEVER'
	}

	export interface ViewerOptions {
		container?: HTMLElement;
		renderer?: THREE.WebGLRenderer;
		camera?: THREE.Camera;
		cameraUp?: number[];
		initialCameraPosition?: number[];
		initialCameraLookAt?: number[];
		backgroundColor?: number[];
		selfDrivenMode?: boolean;
		useBuiltInControls?: boolean;
		sharedMemoryForWorkers?: boolean;
		gpuAcceleratedSort?: boolean;
		integerBasedSort?: boolean;
		halfPrecisionCovariancesOnGPU?: boolean;
		sceneRevealMode?: SceneRevealMode;
		renderMode?: RenderMode;
		dynamicScene?: boolean;
	}

	export interface DropInViewerOptions {
		selfDrivenMode?: boolean;
		gpuAcceleratedSort?: boolean;
		integerBasedSort?: boolean;
		halfPrecisionCovariancesOnGPU?: boolean;
		useBuiltInControls?: boolean;
		sharedMemoryForWorkers?: boolean;
	}

	export interface SplatSceneOptions {
		splatAlphaRemovalThreshold?: number;
		showLoadingUI?: boolean;
		progressiveLoad?: boolean;
	}
}
