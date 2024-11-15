export type WorkTag = '3D' | 'Print' | 'Sculpture' | 'Paint' | 'Digital' | 'Extra';

export interface WorkMetadata {
    title: string;
    image: string;
    tags: WorkTag[];
    description?: string;  // Optional since not marked as required in config
    Date: string;  // Now a free-form string field
}
