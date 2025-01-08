import type { QualityPreset } from '$lib/stores/viewer-settings';
import { browser } from '$app/environment';

interface DeviceCapabilities {
	isMobile: boolean;
	gpuTier: 'low' | 'medium' | 'high';
	pixelRatio: number;
	fps: number;
}

function isMobileDevice(): boolean {
	if (!browser) return false;
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function detectGPUTier(): 'low' | 'medium' | 'high' {
	if (!browser) return 'medium';

	const canvas = document.createElement('canvas');
	const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

	if (!gl) return 'low';

	// Type assertion for WebGL context
	const webgl = gl as WebGLRenderingContext;
	const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
	if (!debugInfo) return 'medium';

	const renderer = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

	// Check for mobile GPUs
	if (renderer.includes('mali') || renderer.includes('adreno') || renderer.includes('apple gpu')) {
		return 'low';
	}

	// Check for integrated GPUs
	if (renderer.includes('intel') || renderer.includes('iris') || renderer.includes('hd graphics')) {
		return 'medium';
	}

	// Check for dedicated GPUs
	if (
		renderer.includes('nvidia') ||
		renderer.includes('radeon') ||
		renderer.includes('geforce') ||
		renderer.includes('rtx')
	) {
		return 'high';
	}

	return 'medium';
}

function measureFPS(): Promise<number> {
	return new Promise((resolve) => {
		if (!browser) {
			resolve(60);
			return;
		}

		let frameCount = 0;
		const startTime = performance.now();
		const duration = 500; // Measure for 500ms

		function countFrame(timestamp: number) {
			frameCount++;
			if (timestamp - startTime < duration) {
				requestAnimationFrame(countFrame);
			} else {
				const fps = (frameCount * 1000) / duration;
				resolve(Math.min(fps, 60)); // Cap at 60fps
			}
		}

		requestAnimationFrame(countFrame);
	});
}

export async function detectDeviceCapabilities(): Promise<DeviceCapabilities> {
	const isMobile = isMobileDevice();
	const gpuTier = detectGPUTier();
	const pixelRatio = browser ? window.devicePixelRatio : 1;
	const fps = await measureFPS();

	return {
		isMobile,
		gpuTier,
		pixelRatio,
		fps
	};
}

export async function detectOptimalQuality(): Promise<QualityPreset> {
	const capabilities = await detectDeviceCapabilities();

	// Force low quality on mobile devices
	if (capabilities.isMobile) {
		return 'low';
	}

	// If FPS is too low, drop to lower quality
	if (capabilities.fps < 30) {
		return 'low';
	}

	// Map GPU tier to quality preset
	switch (capabilities.gpuTier) {
		case 'low':
			return 'low';
		case 'medium':
			return 'default';
		case 'high':
			return capabilities.fps > 45 ? 'high' : 'default';
		default:
			return 'default';
	}
}
