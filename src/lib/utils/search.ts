import FlexSearch from 'flexsearch';
import type { WorkMetadata } from '$lib/types';

let worksIndex: FlexSearch.Index;
let works: WorkMetadata[];

export function createWorksIndex(data: WorkMetadata[]) {
	// create the works index
	worksIndex = new FlexSearch.Index({
		tokenize: 'forward',
		preset: 'performance',
		optimize: true
	});

	data.forEach((work, i) => {
		// index the title and content together
		const item = `${work.title} ${work.year} ${work.description} ${work.tags?.join(' ')}`;
		// add the item to the index 👍️
		worksIndex.add(i, item);
	});

	console.log('worksIndex created');

	works = data;
}

export function searchWorksIndex(searchTerm: string) {
	// escape special regex characters
	const match = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	// return matching work indexes 💪
	const results = worksIndex.search(match);

	return results.map((index) => works[index as number]);
}

export function searchWorksByTags(tags: string[]) {
	const results = worksIndex.search(tags.join(' '));
	return results.map((index) => works[index as number]);
}

// function getMatches(text: string, searchTerm: string, limit = 1) {
// 	// create dynamic regex 😎
// 	const regex = new RegExp(searchTerm, 'gi');
// 	// word indexes
// 	const indexes = [];
// 	// matches count
// 	let matches = 0;
// 	// current match in loop
// 	let match;

// 	while ((match = regex.exec(text)) !== null && matches < limit) {
// 		// push that shit
// 		indexes.push(match.index);
// 		// increment matches
// 		matches++;
// 	}

// 	// take the word index...
// 	return indexes.map((index) => {
// 		// go back 20 characters
// 		const start = index - 20;
// 		// go forward 80 characters
// 		const end = index + 80;
// 		// yoink the text
// 		const excerpt = text.substring(start, end).trim();
// 		// return excerpt 🤝
// 		return `...${replaceTextWithMarker(excerpt, searchTerm)}...`;
// 	});
// }

// function replaceTextWithMarker(text: string, match: string) {
// 	// create dynamic regex 😎
// 	const regex = new RegExp(match, 'gi');
// 	// preserves the text casing 🤙
// 	return text.replaceAll(regex, (match) => `<mark>${match}</mark>`);
// }
