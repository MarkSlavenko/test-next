import { useState, useMemo, useEffect, useCallback } from 'react';
import { SearchResult } from '@/lib/api';
import { escapeRegExp } from '@/utils/string';
import { useDebounce } from './useDebounce';

export function useFindInPage(results: SearchResult[]) {
  const [findQuery, setFindQuery] = useState('');
  const debouncedQuery = useDebounce(findQuery, 300);
  const [activeMatchIdx, setActiveMatchIdx] = useState(0);

  const { items: resultsWithOffsets, totalMatches } = useMemo(() => {
    if (!results.length) return { items: [], totalMatches: 0 };

    let total = 0;
    const items = results.map(result => {
      const safeQuery = debouncedQuery ? escapeRegExp(debouncedQuery) : '';
      const regex = safeQuery ? new RegExp(safeQuery, 'gi') : null;

      const titleMatches = regex ? (result.title.match(regex) || []).length : 0;
      const urlMatches = regex ? (result.url.match(regex) || []).length : 0;

      const item = {
        ...result,
        titleOffset: total,
        urlOffset: total + titleMatches,
      };

      total += titleMatches + urlMatches;
      return item;
    });

    return { items, totalMatches: total };
  }, [results, debouncedQuery]);

  useEffect(() => {
    setActiveMatchIdx(0);
  }, [debouncedQuery, results]);

  const navigateFind = useCallback((direction: 'next' | 'prev') => {
    if (totalMatches === 0) return;
    setActiveMatchIdx(prev =>
      direction === 'next'
        ? (prev + 1) % totalMatches
        : (prev - 1 + totalMatches) % totalMatches
    );
  }, [totalMatches]);

  useEffect(() => {
    if (totalMatches > 0) {
      const el = document.getElementById(`match-${activeMatchIdx}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeMatchIdx, totalMatches]);

  const resetFind = useCallback(() => {
    setFindQuery('');
    setActiveMatchIdx(0);
  }, []);

  return {
    findQuery,
    setFindQuery,
    activeMatchIdx,
    resultsWithOffsets,
    totalMatches,
    navigateFind,
    resetFind,
  };
}
