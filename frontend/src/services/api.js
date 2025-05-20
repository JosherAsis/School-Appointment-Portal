import axios from 'axios';

// Simple in-memory cache
const cache = {
  data: new Map(),
  timeout: new Map(),
};

// Default cache time (5 minutes)
const DEFAULT_CACHE_TIME = 5 * 60 * 1000;

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout to prevent hanging requests
  timeout: 10000 // 10 seconds
});

// Add a request interceptor to include auth token and handle caching
api.interceptors.request.use(
  (config) => {
    // Add cache control for GET requests
    if (config.method === 'get' && config.cache !== false) {
      const cacheKey = getCacheKey(config);

      // Check if we have a cached response
      if (cache.data.has(cacheKey) && !isExpired(cacheKey)) {
        // Return cached response as a Promise
        const cachedResponse = cache.data.get(cacheKey);

        // Mark this request as cached
        config.adapter = () => {
          return Promise.resolve({
            data: cachedResponse,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            cached: true
          });
        };
      }
    }

    // Add auth token to request
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
      // Use debug level logging instead of info level
      if (process.env.NODE_ENV === 'development') {
        console.debug('Adding auth token to request:', config.url);
      }
    } else if (config.requiresAuth !== false) {
      // Only warn for requests that should have auth
      console.warn('No auth token found for request:', config.url);
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors and caching
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && !response.cached && response.config.cache !== false) {
      const cacheKey = getCacheKey(response.config);
      const cacheTime = response.config.cacheTime || DEFAULT_CACHE_TIME;

      // Store response data in cache
      cache.data.set(cacheKey, response.data);

      // Set expiration timeout
      const timeoutId = setTimeout(() => {
        cache.data.delete(cacheKey);
        cache.timeout.delete(cacheKey);
      }, cacheTime);

      // Store timeout ID for potential early clearing
      cache.timeout.set(cacheKey, timeoutId);
    }

    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with an error status
      console.error('API Error:', error.response.status, error.response.data);

      // Handle 401 Unauthorized errors (token expired, etc.)
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Dispatch an event that can be listened to for redirecting
        window.dispatchEvent(new CustomEvent('auth-error', {
          detail: { status: 401, message: 'Authentication expired' }
        }));
      }

      // Handle 429 Too Many Requests
      if (error.response.status === 429) {
        console.warn('Rate limit exceeded. Implementing exponential backoff.');
        // Could implement retry logic here
      }

    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);

      // Dispatch network error event
      window.dispatchEvent(new CustomEvent('network-error', {
        detail: { message: 'Network connection issue' }
      }));

    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper function to generate a cache key from request config
function getCacheKey(config) {
  return `${config.url}|${JSON.stringify(config.params || {})}`;
}

// Helper function to check if a cached item is expired
function isExpired(cacheKey) {
  return !cache.timeout.has(cacheKey);
}

// Add cache control methods to the api object
api.clearCache = (url = null) => {
  if (url) {
    // Clear specific URL pattern
    cache.data.forEach((_, key) => {
      if (key.startsWith(url)) {
        const timeoutId = cache.timeout.get(key);
        if (timeoutId) clearTimeout(timeoutId);
        cache.data.delete(key);
        cache.timeout.delete(key);
      }
    });
  } else {
    // Clear all cache
    cache.data.clear();
    cache.timeout.forEach(timeoutId => clearTimeout(timeoutId));
    cache.timeout.clear();
  }
};

export default api;
