<script lang="ts">
	import slug from 'slug';
	import { untrack } from 'svelte';
	import { queryParameters, ssp } from 'sveltekit-search-params';

	import type { About as AboutType, WorkMetadata, Global as GlobalType } from '$lib/types';
	import { createWorksIndex, filterByTags, searchInFilteredWorks } from '$lib/utils/search';
	import { isLoading, openModal, selectedWork } from '$lib/stores';

	import Work from '$lib/components/Work.svelte';
	import About from '$lib/components/About.svelte';
	import ImageModal from '$lib/components/viewers/ImageModal.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import Loader from '$lib/components/Loader.svelte';

	let {
		data
	}: { data: { works: WorkMetadata[]; about: AboutType; tags: string[]; global: GlobalType } } =
		$props();
	let works = data.works;

	let searchIndexStatus: 'loading' | 'ready' = $state('loading');

	const params = queryParameters({
		art: true,
		tags: ssp.array<string>(),
		search: true
	});

	let search = $derived(params.search);
	let tags = $derived(params.tags);

	let filteredWorks = $derived.by(() => {
		if (searchIndexStatus !== 'ready') return works;

		// First filter by tags if any
		let results = tags && tags.length > 0 ? filterByTags(tags) : works;

		// Then search in filtered results if search term exists
		if (search && search !== '') {
			results = searchInFilteredWorks(search, results);
		}

		return results;
	});

	$effect(() => {
		untrack(() => {
			createWorksIndex(works);
			searchIndexStatus = 'ready';
			if (params.art) {
				$selectedWork = works.find((work) => slug(work.title) === params.art) ?? null;
				$openModal = true;
			}
			$isLoading = false;
		});
	});
</script>

<svelte:head>
	<title>{data.global.title}</title>
	<meta name="description" content={data.global.description} />
	<meta name="keywords" content={data.global.keywords} />
	<meta name="image" content={data.global.logo} />
	<meta name="author" content="Zebra" />
	<meta property="og:title" content={data.global.title} />
	<meta property="og:description" content={data.global.description} />
	<meta property="og:image" content={data.global.logo} />
</svelte:head>

<Nav tags={data.tags} global={data.global} />
<About data={data.about} />
<ImageModal />
{#if $isLoading}
	<Loader />
{:else}
	<div class="fixed inset-0 h-screen w-screen overflow-hidden bg-black">
		<div class="overflow-container h-full w-full">
			{#each filteredWorks as work}
				<Work {work} />
			{/each}
		</div>
	</div>
{/if}

<style>
	.overflow-container {
		position: relative;
		margin: 0 auto;
	}
</style>
