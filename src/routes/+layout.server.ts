import globalJson from '$lib/db/global.json';
import type { Global } from '$lib/types';
export const load = async () => {
	const global = globalJson as Global;
	return {
		global
	};
};
