import { tags, works } from '$lib/components/works.svelte';
import profileJson from '$lib/about/profile.json';
import type { Profile } from '$lib/types';

export const load = async () => {
	const profile = profileJson as Profile;

	return {
		works: works.length === 0 ? [] : works,
		tags: tags.length === 0 ? [] : tags,
		profile
	};
};
