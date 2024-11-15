const CACHE_NAME = 'work-images-cache-v1';

function normalizeUrl(url: string): string {
	// If it's already a full URL, return it
	if (url.startsWith('http')) {
		return url;
	}
	// Otherwise, construct the full URL
	return new URL(url, window.location.origin).href;
}

export async function cacheImages(imageUrls: string[]): Promise<void> {
	if (!('caches' in window)) {
		console.warn('Cache API is not supported in this browser');
		return;
	}

	try {
		const cache = await caches.open(CACHE_NAME);
		const existingRequests = await cache.keys();
		const existingUrls = existingRequests.map((request) => request.url);

		const normalizedUrls = imageUrls.map(normalizeUrl);
		const newUrls = normalizedUrls.filter((url) => !existingUrls.includes(url));

		if (newUrls.length > 0) {
			await Promise.all(
				newUrls.map(async (url) => {
					try {
						const response = await fetch(url);
						if (!response.ok) {
							throw new Error(`HTTP error! status: ${response.status}`);
						}
						await cache.put(url, response);
					} catch (error) {
						console.error(`Failed to cache ${url}:`, error);
					}
				})
			);
		}
	} catch (error) {
		console.error('Failed to cache images:', error);
	}
}

export async function getCachedImage(url: string): Promise<Response | undefined> {
	if (!('caches' in window)) {
		console.warn('Cache API is not supported in this browser');
		return undefined;
	}

	try {
		const cache = await caches.open(CACHE_NAME);
		const normalizedUrl = normalizeUrl(url);
		const response = await cache.match(normalizedUrl);

		return response || undefined;
	} catch (error) {
		console.error('Failed to get cached image:', error);
		return undefined;
	}
}
