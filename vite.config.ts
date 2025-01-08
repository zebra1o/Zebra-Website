import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';

// const createManualChunks = (id: string) => {
// 	// Vendor dependencies
// 	if (id.includes('node_modules')) {
// 		if (id.includes('three')) {
// 			if (id.includes('examples/jsm/controls/')) {
// 				return 'three-controls';
// 			}
// 			if (id.includes('examples/jsm/loaders/')) {
// 				return 'three-loaders';
// 			}
// 			if (id.includes('examples/')) {
// 				return 'three-extras';
// 			}
// 			return 'three-core';
// 		}

// 		if (id.includes('gsap')) {
// 			return 'vendor-animation';
// 		}
// 		if (id.includes('gsplat')) {
// 			return 'vendor-splat';
// 		}
// 		if (id.includes('@sveltejs')) {
// 			return 'framework';
// 		}

// 		return 'vendor';
// 	}

// 	// Application code
// 	if (id.includes('src/lib/')) {
// 		// Viewers
// 		if (id.includes('/components/viewers/')) {
// 			return 'app-viewers';
// 		}
// 		// Other components
// 		if (id.includes('/components/')) {
// 			return 'app-components';
// 		}
// 		// Core functionality
// 		if (id.includes('/stores/') || id.includes('gsap.config')) {
// 			return 'app-core';
// 		}
// 		// Utils
// 		if (id.includes('/utils/')) {
// 			return 'app-components'; // Merge with components since it's small
// 		}
// 	}

// 	// Routes
// 	if (id.includes('src/routes/')) {
// 		return 'app-routes';
// 	}

// 	return undefined;
// };

export default defineConfig({
	plugins: [
		enhancedImages(),
		sveltekit(),
		{
			name: 'configure-response-headers',
			configureServer: (server) => {
				server.middlewares.use((_req, res, next) => {
					res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
					res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
					next();
				});
			}
		}
	],
	build: {
		target: 'esnext',
		reportCompressedSize: true,
		chunkSizeWarningLimit: 1000
		// rollupOptions: {
		// 	output: {
		// 		manualChunks: {
		// 			'zoom-image': ['@zoom-image/core', '@zoom-image/svelte'],
		// 			...createManualChunks
		// 		}
		// 	}
		// }
	},
	optimizeDeps: {
		exclude: ['gsplat'],
		include: ['three', 'gsap']
	},
	ssr: {
		noExternal: ['@zoom-image/core', '@zoom-image/svelte']
	},
	assetsInclude: [
		'**/*.glb',
		'**/*.gltf',
		'**/*.splat',
		'**/*.ply',
		'**/*.png',
		'**/*.jpg',
		'**/*.jpeg',
		'**/*.gif',
		'**/*.svg',
		'**/*.webp'
	],
	server: {
		fs: {
			strict: false
		}
	}
});
