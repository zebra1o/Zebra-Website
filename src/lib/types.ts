export type ModelFormat = 'glb' | 'gltf' | 'splat' | 'ply';

export interface WorkMetadata {
	title: string;
	image: string;
	year?: string;
	description?: string;
	tags?: string[];
	has_model?: boolean;
	model_format?: string;
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

export type SocialPlatform =
	| 'Instagram'
	| 'Twitter'
	| 'LinkedIn'
	| 'GitHub'
	| 'Behance'
	| 'ArtStation';

export interface SocialLink {
	platform: SocialPlatform;
	url: string;
}

export interface Education {
	institution: string;
	degree: string;
	year: string;
}

export interface Exhibition {
	title: string;
	venue: string;
	year: string;
	description?: string;
}

export interface CV {
	education: Education[];
	exhibitions: Exhibition[];
}

export interface About {
	bio?: string;
	email?: string;
	location?: string;
	avatar?: string;
	bg_image?: string;
	cv?: {
		education?: {
			institution: string;
			degree: string;
			year: string;
		}[];
		exhibitions?: {
			title: string;
			venue: string;
			year: string;
			description?: string;
		}[];
	};
	social?: {
		platform: string;
		url: string;
	}[];
}

export interface Global {
	title: string;
	description?: string;
	logo?: string;
	filter_bg?: string;
	logo_3d?: string;
	keywords?: string;
}

export interface SearchResult {
	id: number;
	score: number;
	doc: WorkMetadata;
}

export interface SearchOptions {
	limit?: number;
	suggest?: boolean;
	bool?: 'and' | 'or';
	fields?: string[];
}
