import { tags, works } from '$lib/components/works.svelte';
import aboutJson from '$lib/db/about.json';
import type { About } from '$lib/types';

export const load = async () => {
	const about = aboutJson as About;

	return {
		works: works.length === 0 ? [] : works,
		tags: tags.length === 0 ? [] : tags,
		about
	};
};
