import type { WorkMetadata } from '$lib/types';

// Import all markdown files dynamically
const markdownFiles = import.meta.glob<{ metadata: WorkMetadata }>('/src/lib/db/works/*.md', {
	eager: true,
	query: {
		enhanced: true
	}
});

// Extract and combine all metadata into a single array
export const works: WorkMetadata[] = Object.values(markdownFiles).map((file) => file.metadata);

// Get all tags from works
const allTags: string[] = works.flatMap((work) => work.tags ?? []);

// Remove duplicates, sort by frequency and remove empty strings
export const tags: string[] = [...new Set(allTags)]
	.sort((a, b) => allTags.filter((t) => t === b).length - allTags.filter((t) => t === a).length)
	.filter((t) => t !== '' && t !== ' ' && t !== null && t !== undefined);
