import { tags, works } from '$lib/components/works.svelte';
import aboutJson from '$lib/db/about.json';
import globalJson from '$lib/db/global.json';
import type { About, Global } from '$lib/types';

export const load = async () => {
	const about = aboutJson as About;
	const global = globalJson as Global;
	return {
		works: works.length === 0 ? [] : works,
		tags: tags.length === 0 ? [] : tags,
		about,
		global
	};
};
