/**
 * Simple in-memory cache manager for database queries
 */

// Cache storage
const cache = new Map();

// Default cache expiration time (5 minutes)
const DEFAULT_CACHE_TIME = 5 * 60 * 1000;

/**
 * Get a value from the cache
 * @param {string} key - Cache key
 * @returns {any|null} - Cached value or null if not found or expired
 */
const get = (key) => {
  if (!cache.has(key)) return null;

  const { value, expiry } = cache.get(key);
  const now = Date.now();

  // Check if the cached value has expired
  if (now > expiry) {
    cache.delete(key);
    return null;
  }

  return value;
};

/**
 * Set a value in the cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
 */
const set = (key, value, ttl = DEFAULT_CACHE_TIME) => {
  const expiry = Date.now() + ttl;
  cache.set(key, { value, expiry });
};

/**
 * Delete a value from the cache
 * @param {string} key - Cache key
 */
const del = (key) => {
  cache.delete(key);
};

/**
 * Clear all values from the cache or by pattern
 * @param {string} pattern - Optional pattern to match keys
 */
const clear = (pattern = null) => {
  if (pattern) {
    const regex = new RegExp(pattern);
    for (const key of cache.keys()) {
      if (regex.test(key)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

/**
 * Get cache stats
 * @returns {Object} - Cache statistics
 */
const stats = () => {
  const now = Date.now();
  let size = 0;
  let activeEntries = 0;
  let expiredEntries = 0;

  for (const [key, { expiry }] of cache.entries()) {
    size++;
    if (now > expiry) {
      expiredEntries++;
    } else {
      activeEntries++;
    }
  }

  return {
    size,
    activeEntries,
    expiredEntries
  };
};

/**
 * Wrap a database query function with caching
 * @param {Function} queryFn - Async function that performs the database query
 * @param {string} cacheKey - Key to use for caching
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Promise<any>} - Query result
 */
const cachedQuery = async (queryFn, cacheKey, ttl = DEFAULT_CACHE_TIME) => {
  // Check cache first
  const cachedResult = get(cacheKey);
  if (cachedResult !== null) {
    return cachedResult;
  }

  // Execute the query
  const result = await queryFn();

  // Cache the result
  set(cacheKey, result, ttl);

  return result;
};

module.exports = {
  get,
  set,
  del,
  clear,
  stats,
  cachedQuery,
  DEFAULT_CACHE_TIME
};
