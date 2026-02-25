// Request cache and rate limiting utility
class RequestCache {
  constructor() {
    this.cache = new Map();
    this.requestTimes = new Map();
    this.minInterval = 5000; // Increased to 5 seconds between identical requests
  }

  // Generate cache key from URL and params
  getCacheKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    return `${url}?${JSON.stringify(sortedParams)}`;
  }

  // Check if request should be throttled
  shouldThrottle(cacheKey) {
    const lastRequestTime = this.requestTimes.get(cacheKey);
    if (!lastRequestTime) return false;
    
    const timeSinceLastRequest = Date.now() - lastRequestTime;
    return timeSinceLastRequest < this.minInterval;
  }

  // Get cached response if available and fresh
  getCached(cacheKey, maxAge = 120000) { // Increased to 2 minutes default
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > maxAge) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.data;
  }

  // Set cache entry
  setCache(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    this.requestTimes.set(cacheKey, Date.now());
  }

  // Clear cache for specific key or all
  clearCache(cacheKey = null) {
    if (cacheKey) {
      this.cache.delete(cacheKey);
      this.requestTimes.delete(cacheKey);
    } else {
      this.cache.clear();
      this.requestTimes.clear();
    }
  }

  // Clean old entries
  cleanup() {
    const now = Date.now();
    const maxAge = 600000; // Increased to 10 minutes
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key);
        this.requestTimes.delete(key);
      }
    }
  }
}

// Global instance
export const requestCache = new RequestCache();

// Cleanup every 5 minutes
setInterval(() => {
  requestCache.cleanup();
}, 300000);
