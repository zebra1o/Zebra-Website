import type { QualityPreset } from '$lib/stores/viewer-settings';
import { browser } from '$app/environment';

interface DeviceCapabilities {
	isMobile: boolean;
	gpuTier: 'low' | 'high';
	pixelRatio: number;
}

function isMobileDevice(): boolean {
	if (!browser) return false;
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function detectGPUTier(): 'low' | 'high' {
	if (!browser) return 'low';

	const canvas = document.createElement('canvas');
	const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

	if (!gl) return 'low';
	return 'high';
}

export function detectDeviceCapabilities(): DeviceCapabilities {
	const isMobile = isMobileDevice();
	const gpuTier = detectGPUTier();
	const pixelRatio = browser ? window.devicePixelRatio : 1;

	return {
		isMobile,
		gpuTier,
		pixelRatio
	};
}

export function detectOptimalQuality(): QualityPreset {
	const capabilities = detectDeviceCapabilities();

	if (capabilities.isMobile) {
		return 'low';
	}

	switch (capabilities.gpuTier) {
		case 'low':
			return 'low';
		case 'high':
			return 'default';
		default:
			return 'default';
	}
}
