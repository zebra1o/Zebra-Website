import type { WorkMetadata } from '$lib/types';

// Import all markdown files dynamically
const markdownFiles = import.meta.glob<{ metadata: WorkMetadata }>('/src/lib/works/*.md', {
	eager: true
});

// Extract and combine all metadata into a single array
export const works: WorkMetadata[] = Object.values(markdownFiles).map((file) => file.metadata);
