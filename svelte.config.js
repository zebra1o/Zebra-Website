import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// See below for an explanation of these options
	routes: {
		include: ['/*'],
		exclude: ['<all>']
	},
	platformProxy: {
		configPath: 'wrangler.toml',
		environment: undefined,
		experimentalJsonConfig: false,
		persist: false
	},
	preprocess: [
		mdsvex({
			extensions: ['.md', '.svx'],
			smartypants: {
				dashes: 'oldschool'
			}
		}),
		vitePreprocess()
	],

	kit: {
		adapter: adapter()
	},

	extensions: ['.svelte', '.md', '.svx']
};

export default config;
