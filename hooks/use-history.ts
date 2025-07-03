'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HistoryResponse } from '@/types';

export function useHistory() {
  const [images, setImages] = useState<HistoryResponse['history']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const limit = 20;

  const fetchHistory = useCallback(async (reset = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const currentOffset = reset ? 0 : offset;
      const response = await fetch(`/api/history?limit=${limit}&offset=${currentOffset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data: HistoryResponse = await response.json();
      
      if (reset) {
        setImages(data.history);
        setOffset(limit);
      } else {
        setImages(prev => [...prev, ...data.history]);
        setOffset(prev => prev + limit);
      }
      
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [offset, isLoading]);

  const loadMore = useCallback(() => {
    fetchHistory(false);
  }, [fetchHistory]);

  const refresh = useCallback(() => {
    fetchHistory(true);
  }, [fetchHistory]);

  useEffect(() => {
    fetchHistory(true);
  }, []);

  return {
    images,
    isLoading,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}