/**
 * cache.js
 *
 * @description Lightweight in-memory cache with TTL (Time-To-Live) support.
 * @usage Import and use `cache.get(key)`, `cache.set(key, value, ttlSeconds)`, `cache.invalidate(pattern)`.
 * @details Zero-dependency. Stores data in a Map with automatic expiry.
 *          Designed for caching frequently-read, rarely-changed data like
 *          the weekly menu, active polls, and rating stats.
 */

class MemoryCache {
    constructor() {
        this.store = new Map();

        // Cleanup expired entries every 60 seconds
        this._cleanupInterval = setInterval(() => this._cleanup(), 60_000);
    }

    /**
     * Get a cached value by key.
     * Returns undefined if the key doesn't exist or has expired.
     */
    get(key) {
        const entry = this.store.get(key);
        if (!entry) return undefined;

        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }

        return entry.value;
    }

    /**
     * Set a value in the cache.
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttlSeconds - Time-to-live in seconds (default: 300 = 5 minutes)
     */
    set(key, value, ttlSeconds = 300) {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }

    /**
     * Delete a specific cache key.
     */
    del(key) {
        this.store.delete(key);
    }

    /**
     * Invalidate all keys that start with the given prefix.
     * Example: cache.invalidate("menu") clears "menu", "menu:polls", etc.
     */
    invalidate(prefix) {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Clear the entire cache.
     */
    flush() {
        this.store.clear();
    }

    /** Internal: remove expired entries */
    _cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.store) {
            if (now > entry.expiresAt) {
                this.store.delete(key);
            }
        }
    }
}

// Singleton — all routes share the same cache instance
const cache = new MemoryCache();
export default cache;
