export const prerender = true;
export const ssr = true;
import { works } from '$lib/components/works.svelte';

export const load = async () => {
	if (works.length === 0) {
		return { works: [] };
	}

	return { works };
};
