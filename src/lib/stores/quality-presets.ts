import type { QualityPreset } from './viewer-settings';
import * as THREE from 'three';
import { browser } from '$app/environment';

// Default values for server-side rendering
const DEFAULT_PIXEL_RATIO = 1;

function getPixelRatio(multiplier = 1) {
	return browser ? Math.min(multiplier, window.devicePixelRatio) : DEFAULT_PIXEL_RATIO;
}

// Available material presets
export const materialPresets = {
	default: {
		roughness: 0.5,
		metalness: 0.5,
		envMapIntensity: 1.0
	},
	metal: {
		roughness: 0.2,
		metalness: 0.8,
		envMapIntensity: 1.2
	},
	plastic: {
		roughness: 0.9,
		metalness: 0.1,
		envMapIntensity: 0.8
	},
	glass: {
		roughness: 0.1,
		metalness: 0.9,
		envMapIntensity: 1.5,
		transparent: true,
		opacity: 0.8
	},
	ceramic: {
		roughness: 0.7,
		metalness: 0.2,
		envMapIntensity: 0.9
	}
} as const;

export type MaterialPreset = keyof typeof materialPresets;

export interface QualitySettings {
	renderer: {
		antialias: boolean;
		precision: 'lowp' | 'mediump' | 'highp';
		powerPreference: 'low-power' | 'high-performance' | 'default';
		shadowMap: {
			enabled: boolean;
			type: THREE.ShadowMapType;
			mapSize: number;
		};
		pixelRatio: number;
		toneMapping: THREE.ToneMapping;
	};
	postProcessing: {
		enabled: boolean;
		samples: number;
		bloom?: {
			threshold: number;
			strength: number;
			radius: number;
		};
	};
	lights: {
		shadowBias: number;
		shadowRadius: number;
		maxLights: number;
		intensity: number; // Global intensity multiplier for mobile
		positions: {
			key: { x: number; y: number; z: number };
			fill: { x: number; y: number; z: number };
			rim: { x: number; y: number; z: number };
		};
	};
	meshes: {
		castShadow: boolean;
		receiveShadow: boolean;
		frustumCulled: boolean;
		anisotropy: number;
		mipMapFilter: THREE.TextureFilter;
		materialPreset: MaterialPreset;
	};
	features: {
		bloom: boolean;
		shadows: boolean;
		anisotropy: boolean;
		highQualityShaders: boolean;
	};
}

export const qualityPresets: Record<QualityPreset, QualitySettings> = {
	low: {
		renderer: {
			antialias: false,
			precision: 'lowp',
			powerPreference: 'low-power',
			shadowMap: {
				enabled: false,
				type: THREE.BasicShadowMap,
				mapSize: 256
			},
			pixelRatio: getPixelRatio(0.75),
			toneMapping: THREE.NoToneMapping
		},
		postProcessing: {
			enabled: false,
			samples: 0
		},
		lights: {
			shadowBias: -0.003,
			shadowRadius: 1,
			maxLights: 2,
			intensity: 1.5,
			positions: {
				key: { x: 1, y: 1.5, z: 1 },
				fill: { x: -1.5, y: 0.5, z: -1.5 },
				rim: { x: 0, y: 2, z: -1.5 }
			}
		},
		meshes: {
			castShadow: false,
			receiveShadow: false,
			frustumCulled: true,
			anisotropy: 1,
			mipMapFilter: THREE.NearestFilter,
			materialPreset: 'default'
		},
		features: {
			bloom: false,
			shadows: false,
			anisotropy: false,
			highQualityShaders: false
		}
	},
	default: {
		renderer: {
			antialias: browser ? window.devicePixelRatio < 2 : true,
			precision: 'highp',
			powerPreference: 'high-performance',
			shadowMap: {
				enabled: true,
				type: THREE.PCFSoftShadowMap,
				mapSize: 512
			},
			pixelRatio: getPixelRatio(1.5),
			toneMapping: THREE.ACESFilmicToneMapping
		},
		postProcessing: {
			enabled: true,
			samples: 2,
			bloom: {
				threshold: 0.75,
				strength: 1.0,
				radius: 0.5
			}
		},
		lights: {
			shadowBias: -0.001,
			shadowRadius: 4,
			maxLights: 3,
			intensity: 1.0,
			positions: {
				key: { x: 1, y: 1.5, z: 1 },
				fill: { x: -1.5, y: 0.5, z: -1.5 },
				rim: { x: 0, y: 2, z: -1.5 }
			}
		},
		meshes: {
			castShadow: true,
			receiveShadow: true,
			frustumCulled: true,
			anisotropy: 4,
			mipMapFilter: THREE.LinearMipmapLinearFilter,
			materialPreset: 'default'
		},
		features: {
			bloom: true,
			shadows: true,
			anisotropy: true,
			highQualityShaders: true
		}
	},
	high: {
		renderer: {
			antialias: true,
			precision: 'highp',
			powerPreference: 'high-performance',
			shadowMap: {
				enabled: true,
				type: THREE.PCFSoftShadowMap,
				mapSize: 2048
			},
			pixelRatio: getPixelRatio(2),
			toneMapping: THREE.ACESFilmicToneMapping
		},
		postProcessing: {
			enabled: true,
			samples: 8,
			bloom: {
				threshold: 0.85,
				strength: 2.0,
				radius: 1.0
			}
		},
		lights: {
			shadowBias: -0.0003,
			shadowRadius: 12,
			maxLights: 3,
			intensity: 1.0,
			positions: {
				key: { x: 1, y: 1.5, z: 1 },
				fill: { x: -1.5, y: 0.5, z: -1.5 },
				rim: { x: 0, y: 2, z: -1.5 }
			}
		},
		meshes: {
			castShadow: true,
			receiveShadow: true,
			frustumCulled: true,
			anisotropy: 16,
			mipMapFilter: THREE.LinearMipmapLinearFilter,
			materialPreset: 'default'
		},
		features: {
			bloom: true,
			shadows: true,
			anisotropy: true,
			highQualityShaders: true
		}
	}
};
