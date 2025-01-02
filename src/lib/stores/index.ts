import { writable } from 'svelte/store';
import type { WorkMetadata } from '$lib/types';

export const isLoading = writable(true);
export const selectedWork = writable<WorkMetadata | null>(null);
export const openModal = writable(false);
export const openAboutModal = writable(false);
export const openFilterPanel = writable(false);
