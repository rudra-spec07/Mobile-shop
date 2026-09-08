/**
 * Simple, bounded, in-memory TTL cache utility.
 * Zero external dependencies.
 */
class MemoryCache {
  constructor(defaultTtlSeconds = 300, maxKeys = 100) {
    this.cache = new Map();
    this.defaultTtl = defaultTtlSeconds * 1000;
    this.maxKeys = maxKeys;

    // Periodic cleanup of expired entries every 60 seconds
    setInterval(() => this.cleanup(), 60000).unref();
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key, value, ttlSeconds = null) {
    if (this.cache.size >= this.maxKeys) {
      // Evict oldest entry if max capacity reached
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    const ttl = (ttlSeconds ? ttlSeconds * 1000 : this.defaultTtl);
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

const brandCache = new MemoryCache(300, 50); // 5 min TTL
const categoryCache = new MemoryCache(300, 50); // 5 min TTL

module.exports = {
  MemoryCache,
  brandCache,
  categoryCache,
};
