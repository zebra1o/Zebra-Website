export type WorkTag =
	| '3D'
	| 'Print'
	| 'Sculpture'
	| 'Paint'
	| 'Digital'
	| 'Extra'
	| 'Illustration'
	| 'Mixed Media';

export interface WorkMetadata {
	title: string;
	image: string;
	tags: WorkTag[];
	description?: string; // Optional since not marked as required in config
	Date: string; // Free-form string field, matching the case in the config
}
