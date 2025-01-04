<script lang="ts">
	import { useDebounce } from 'runed';
	import { Input } from '$lib/components/ui/input';
	import { queryParameters } from 'sveltekit-search-params';
	let debounceDuration = $state(400);

	const params = queryParameters({
		search: true
	});

	let searchText = $state(params.search);

	const search = useDebounce(
		() => {
			if (searchText !== '') {
				params.search = searchText;
			} else {
				params.search = null;
			}
		},
		() => debounceDuration
	);
</script>

<Input type="search" bind:value={searchText} oninput={search} placeholder="type to search" />
