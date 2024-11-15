export type WorkTag = '3D' | 'Print' | 'Sculpture' | 'Paint' | 'Digital' | 'Extra';

export interface WorkMetadata {
    title: string;
    image: string;
    tags: WorkTag[];
    description?: string;  // Optional since not marked as required in config
    date: string;  // Will store date in dd/MM/yyyy format
}
