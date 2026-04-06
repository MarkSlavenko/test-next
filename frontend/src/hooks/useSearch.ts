import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { executeSearch, SearchResult } from '@/lib/api';

const ITEMS_PER_PAGE = 10;

export function useSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const initialQ = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [currentQuery, setCurrentQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
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

      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      params.set('page', page.toString());
      
      const targetUrl = `${pathname}?${params.toString()}`;
      router.push(targetUrl, { scroll: false });

      if (saveToDb) {
        router.refresh(); // optionally sync server component with new history
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
  }, [router, pathname, searchParams]);

  // Initial load
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (!hasLoadedRef.current && initialQ) {
      hasLoadedRef.current = true;
      performSearch(initialQ, false, initialPage);
    }
  }, [initialQ, initialPage, performSearch]);

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
