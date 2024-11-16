export type WorkTag =
	| '3D'
	| 'Print'
	| 'Sculpture'
	| 'Paint'
	| 'Digital'
	| 'Extra'
	| 'Illustration'
	| 'Mixed Media';

export type ModelFormat = 'glb' | 'gltf' | 'splat' | 'ply';

export interface WorkMetadata {
	title: string;
	image: string;
	tags: WorkTag[];
	description?: string;
	Date: string;
	has_model: boolean;
	model_format?: ModelFormat;
	model_file?: string;
}

import type { Object3D } from 'three';

export type ModelResult = {
	type: ModelFormat;
	object: Object3D | null;
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
