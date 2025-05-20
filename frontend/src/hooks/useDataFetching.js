import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * Custom hook for data fetching with caching, error handling, and loading state
 * @param {string} url - API endpoint to fetch data from
 * @param {Object} options - Additional options for the fetch
 * @param {boolean} options.enabled - Whether to enable the fetch (default: true)
 * @param {Array} options.dependencies - Dependencies array for useEffect
 * @param {number} options.cacheTime - Time in ms to cache the data (default: 5 minutes)
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useDataFetching = (url, options = {}) => {
  const {
    enabled = true,
    dependencies = [],
    cacheTime = 5 * 60 * 1000, // 5 minutes default cache time
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use a ref to store cache data and timestamp
  const cacheRef = useRef({
    data: null,
    timestamp: null
  });

  const fetchData = useCallback(async (force = false) => {
    // Skip if disabled
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Check cache first if not forcing a refresh
    if (!force && cacheRef.current.data && cacheRef.current.timestamp) {
      const now = new Date().getTime();
      if (now - cacheRef.current.timestamp < cacheTime) {
        setData(cacheRef.current.data);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    
    try {
      const response = await api.get(url);
      setData(response.data);
      setError(null);
      
      // Update cache
      cacheRef.current = {
        data: response.data,
        timestamp: new Date().getTime()
      };
    } catch (err) {
      console.error(`Error fetching data from ${url}:`, err);
      setError(err.response?.data?.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  }, [url, enabled, cacheTime]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return { data, loading, error, refetch: () => fetchData(true) };
};

/**
 * Custom hook for pagination
 * @param {Array} items - Array of items to paginate
 * @param {number} itemsPerPage - Number of items per page
 * @returns {Object} - { currentItems, currentPage, setCurrentPage, totalPages }
 */
export const usePagination = (items = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate total pages
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  
  // Reset to page 1 if items change and current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [items.length, currentPage, totalPages]);
  
  return { currentItems, currentPage, setCurrentPage, totalPages };
};

/**
 * Custom hook for sorting data
 * @param {Array} items - Array of items to sort
 * @param {Object} initialSortConfig - Initial sort configuration { key, direction }
 * @returns {Object} - { sortedItems, requestSort, sortConfig }
 */
export const useSortableData = (items = [], initialSortConfig = null) => {
  const [sortConfig, setSortConfig] = useState(initialSortConfig);
  
  const sortedItems = useCallback(() => {
    if (!sortConfig) return items;
    
    return [...items].sort((a, b) => {
      if (a[sortConfig.key] === null) return 1;
      if (b[sortConfig.key] === null) return -1;
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [items, sortConfig]);
  
  const requestSort = useCallback((key) => {
    let direction = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  }, [sortConfig]);
  
  return { items: sortedItems(), requestSort, sortConfig };
};
