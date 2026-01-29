import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "recent-searches";
const MAX_RECENT_SEARCHES = 5;

interface RecentSearch {
  query: string;
  timestamp: number;
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading recent searches:", error);
    }
  }, []);

  const addSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.query.toLowerCase() !== query.toLowerCase());
      const updated = [{ query, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Error saving recent searches:", error);
      }
      
      return updated;
    });
  }, []);

  const removeSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s.query !== query);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Error saving recent searches:", error);
      }
      
      return updated;
    });
  }, []);

  const clearSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing recent searches:", error);
    }
  }, []);

  return {
    recentSearches: recentSearches.map((s) => s.query),
    addSearch,
    removeSearch,
    clearSearches,
  };
}
