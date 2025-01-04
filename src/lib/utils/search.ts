import FlexSearch from 'flexsearch';
import type { WorkMetadata, SearchOptions } from '$lib/types';
import slug from 'slug';

interface WorkDocument {
	id: number;
	title: string;
	year: string;
	description: string;
	tags: string[];
	image: string;
}

type FlexSearchResult = {
	field: string;
	result: number[];
};

let documentIndex: FlexSearch.Document<WorkDocument>;
let works: WorkMetadata[] = [];
const workTagsMap = new Map<number, Set<string>>();

export function createWorksIndex(data: WorkMetadata[]): void {
	works = data;
	workTagsMap.clear();

	documentIndex = new FlexSearch.Document<WorkDocument>({
		document: {
			id: 'id',
			index: ['title', 'description', 'year']
		},
		tokenize: 'forward',
		resolution: 9,
		cache: false,
		worker: false,
		context: false
	});

	data.forEach((work, id) => {
		documentIndex.add({
			id,
			title: work.title,
			year: work.year || '',
			description: work.description || '',
			tags: work.tags || [],
			image: work.image
		});

		// Store slugified tags for each work
		if (work.tags?.length) {
			workTagsMap.set(id, new Set(work.tags.map((tag) => slug(tag))));
		}
	});
}

export function searchWorksIndex(searchTerm: string, options: SearchOptions = {}): WorkMetadata[] {
	if (!searchTerm || searchTerm === '') return works;

	const fields = options.fields || ['title', 'description', 'year'];
	const results = fields.flatMap((field) =>
		documentIndex.search(searchTerm, [field])
	) as FlexSearchResult[];

	const matchedIds = new Set(results.flatMap((r) => r.result));
	return Array.from(matchedIds).map((id) => works[id]);
}

export function filterByTags(tags: string[]): WorkMetadata[] {
	if (!tags || tags.length === 0) return works;

	// Tags are already slugified from the UI
	return works.filter((_, index) => {
		const workTags = workTagsMap.get(index);
		if (!workTags) return false;
		// OR operation: work should have at least one of the selected tags
		return tags.some((tag) => workTags.has(tag));
	});
}

export function searchInFilteredWorks(
	searchTerm: string,
	filteredWorks: WorkMetadata[]
): WorkMetadata[] {
	if (!searchTerm || searchTerm === '') return filteredWorks;

	// Create a map of works to their original indices
	const workToIndexMap = new Map(works.map((work, index) => [work, index]));

	const fields = ['title', 'description', 'year'];
	const results = fields.flatMap((field) =>
		documentIndex.search(searchTerm, [field])
	) as FlexSearchResult[];

	const matchedIds = new Set(results.flatMap((r) => r.result));

	// Filter works that are both in the filtered set and match the search
	return filteredWorks.filter((work) => {
		const originalIndex = workToIndexMap.get(work);
		return originalIndex !== undefined && matchedIds.has(originalIndex);
	});
}
