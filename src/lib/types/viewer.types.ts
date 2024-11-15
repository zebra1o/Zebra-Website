import type * as THREE from 'three';

export type ModelType = 'gltf' | 'points' | 'splat';

export type ModelResult = {
	type: ModelType;
	object: THREE.Object3D | null;
} | null;

export type ViewerProps = {
	modelUrl?: string;
	title?: string;
	description?: string;
	height?: string;
};

export type ViewerState = {
	loading: boolean;
	error: string | null;
};
