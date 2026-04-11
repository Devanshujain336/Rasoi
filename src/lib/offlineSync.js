import { get, set } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

const QUEUE_KEY = 'offline-requests-queue';

/**
 * Adds a request to the offline queue.
 * @param {string} url - The API endpoint
 * @param {object} options - Fetch options (method, body, headers)
 */
export const queueRequest = async (url, options) => {
    const queue = (await get(QUEUE_KEY)) || [];
    const newRequest = {
        id: uuidv4(),
        url,
        options,
        timestamp: Date.now(),
    };
    queue.push(newRequest);
    await set(QUEUE_KEY, queue);
    console.log('Request queued offline:', newRequest);
    return newRequest;
};

/**
 * Returns all queued requests.
 */
export const getQueuedRequests = async () => {
    return (await get(QUEUE_KEY)) || [];
};

/**
 * Processes the queue and attempts to send requests to the server.
 * @param {Function} fetcher - A wrapper around fetch that handles auth/base URL (e.g., api.js request)
 */
export const syncOfflineQueue = async (fetcher) => {
    if (!navigator.onLine) return;

    const queue = (await get(QUEUE_KEY)) || [];
    if (queue.length === 0) return;

    console.log(`Attempting to sync ${queue.length} offline requests...`);
    const toastId = toast.loading(`Syncing ${queue.length} offline requests...`);

    const updatedQueue = [...queue];
    const successfullySyncedIds = [];

    for (const req of queue) {
        try {
            await fetcher(req.url, req.options);
            successfullySyncedIds.push(req.id);
            console.log(`Successfully synced request: ${req.id}`);
        } catch (err) {
            console.error(`Failed to sync request ${req.id}:`, err);
            // If it's a 4xx error (validation), we might want to drop it.
            // If it's a network error, we keep it in queue for next time.
            if (err.message && (err.message.includes('400') || err.message.includes('401') || err.message.includes('403'))) {
               successfullySyncedIds.push(req.id);
            }
        }
    }

    const finalQueue = updatedQueue.filter(req => !successfullySyncedIds.includes(req.id));
    await set(QUEUE_KEY, finalQueue);

    if (successfullySyncedIds.length > 0) {
        toast.success(`Successfully synced ${successfullySyncedIds.length} requests`, { id: toastId });
        // Dispatch a custom event so the UI can refresh
        window.dispatchEvent(new CustomEvent('offline-sync-completed', { 
            detail: { count: successfullySyncedIds.length } 
        }));
    } else {
        toast.error("Failed to sync offline requests", { id: toastId });
    }
};
