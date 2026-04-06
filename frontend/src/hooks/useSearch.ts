import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { executeSearch, SearchResult } from '@/lib/api';

const ITEMS_PER_PAGE = 10;

export function useSearch() {
  const router = useRouter();

  const [currentQuery, setCurrentQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (query: string, saveToDb = false, page = 1) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError('');
    setCurrentQuery(query);

    try {
      const data = await executeSearch(query, saveToDb, page, ITEMS_PER_PAGE, abortController.signal);

      setResults(data.results);
      setTotalResults(data.total);
      setCurrentPage(page);

      if (saveToDb) {
        router.refresh();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError('Failed to fetch results. Please try again.');
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [router]);

  return {
    currentQuery,
    results,
    totalResults,
    currentPage,
    isLoading,
    error,
    ITEMS_PER_PAGE,
    performSearch,
  };
}
