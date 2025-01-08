import { writable, type Writable } from 'svelte/store';

export interface LightSettings {
	color: string;
	intensity: number;
	distance: number;
	position: {
		x: number;
		y: number;
		z: number;
	};
}

export interface ViewerSettings {
	visible: boolean;
	lights: {
		key: LightSettings;
		fill: LightSettings;
		rim: LightSettings;
	};
	global: {
		groupDistance: number;
		centerDistance: number;
		bloom: boolean;
		showHelpers: boolean;
	};
}

export const viewerSettings: Writable<ViewerSettings> = writable({
	visible: false,
	lights: {
		key: {
			color: '#ffffff',
			intensity: 1,
			distance: 5,
			position: { x: 5, y: 5, z: 5 }
		},
		fill: {
			color: '#ffffff',
			intensity: 0.5,
			distance: 5,
			position: { x: -5, y: 0, z: -5 }
		},
		rim: {
			color: '#ffffff',
			intensity: 0.3,
			distance: 5,
			position: { x: 0, y: 5, z: -5 }
		}
	},
	global: {
		groupDistance: 10,
		centerDistance: 5,
		bloom: false,
		showHelpers: false
	}
});
