import type * as THREE from 'three';
import type * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

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

export type GaussianSplatViewer = GaussianSplats3D.Viewer;
