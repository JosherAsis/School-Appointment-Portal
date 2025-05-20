/**
 * Middleware for cache invalidation
 */
const cacheManager = require('../utils/cacheManager');

/**
 * Invalidate cache for specific resources when data changes
 * @param {string|Array} resources - Resource(s) to invalidate
 * @returns {Function} Express middleware
 */
const invalidateCache = (resources) => {
  return (req, res, next) => {
    // Store the original end method
    const originalEnd = res.end;
    
    // Override the end method
    res.end = function(chunk, encoding) {
      // Only invalidate cache on successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Convert single resource to array
        const resourceList = Array.isArray(resources) ? resources : [resources];
        
        // Invalidate each resource
        resourceList.forEach(resource => {
          switch (resource) {
            case 'dashboard':
              cacheManager.del('dashboard_main');
              break;
            case 'analytics':
              cacheManager.del('dashboard_analytics');
              break;
            case 'appointments':
              cacheManager.clear('appointments');
              // Also invalidate dashboard and analytics since they depend on appointments
              cacheManager.del('dashboard_main');
              cacheManager.del('dashboard_analytics');
              break;
            case 'time_slots':
              cacheManager.clear('time_slots');
              break;
            case 'students':
              cacheManager.clear('students');
              break;
            case 'users':
              cacheManager.clear('users');
              break;
            case 'all':
              cacheManager.clear();
              break;
            default:
              // If resource is a string but not one of the predefined ones,
              // treat it as a cache key pattern
              cacheManager.clear(resource);
          }
        });
      }
      
      // Call the original end method
      originalEnd.apply(res, arguments);
    };
    
    next();
  };
};

module.exports = invalidateCache;
