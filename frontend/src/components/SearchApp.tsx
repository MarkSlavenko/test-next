'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { searchSchema, SearchFormValues, executeSearch, SearchResult, SearchHistoryItem } from '@/lib/api';
import { HighlightText } from './HighlightText';
import { escapeRegExp } from '@/utils/string';
import { HistorySidebar } from '@/components/HistorySidebar';
import { FindInPageToolbar } from '@/components/FindInPageToolbar';
import { PaginationControls } from '@/components/PaginationControls';

const ITEMS_PER_PAGE = 10;

export default function SearchApp({ initialHistory }: { initialHistory: SearchHistoryItem[] }) {
  const router = useRouter();

  // Data State
  const [currentQuery, setCurrentQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Find in page state
  const [findQuery, setFindQuery] = useState('');
  const [activeMatchIdx, setActiveMatchIdx] = useState(0);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
  });

  const performSearch = async (query: string, saveToDb = false, page = 1) => {
    setIsLoading(true);
    setError('');
    setCurrentQuery(query);

    try {
      const data = await executeSearch(query, saveToDb, page, ITEMS_PER_PAGE);

      setResults(data.results);
      setTotalResults(data.total);
      setCurrentPage(page);
      setFindQuery('');
      setActiveMatchIdx(0);

      if (saveToDb) router.refresh();
    } catch (err) {
      setError('Failed to fetch results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: SearchFormValues) => performSearch(data.query, true, 1);
  const handleHistoryClick = (query: string) => {
    setValue('query', query);
    performSearch(query, false, 1);
  };
  const handlePageChange = (newPage: number) => performSearch(currentQuery, false, newPage);

  const { items: resultsWithOffsets, totalMatches } = useMemo(() => {
    if (!results.length) return { items: [], totalMatches: 0 };

    let total = 0;
    const items = results.map(result => {
      const safeQuery = findQuery ? escapeRegExp(findQuery) : '';
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
  }, [results, findQuery]);

  useEffect(() => {
    setActiveMatchIdx(0);
  }, [findQuery]);

  const scrollToMatch = () => {
    if (totalMatches > 0) {
      const el = document.getElementById(`match-${activeMatchIdx}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  useEffect(() => {
    scrollToMatch();
  }, [activeMatchIdx, totalMatches]);

  const navigateFind = (direction: 'next' | 'prev') => {
    if (totalMatches === 0) return;
    setActiveMatchIdx(prev =>
      direction === 'next'
        ? (prev + 1) % totalMatches
        : (prev - 1 + totalMatches) % totalMatches
    );
  };

  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-900">
      <HistorySidebar history={initialHistory} onSelect={handleHistoryClick} />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Search Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mb-8 relative">
            <div className="relative">
              <input
                {...register('query')}
                type="text"
                placeholder="Search DuckDuckGo..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
              </button>
            </div>
            {errors.query && <p className="text-red-500 text-sm mt-2 absolute">{errors.query.message}</p>}
          </form>

          {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
          {totalResults > 0 && !isLoading && <p className="text-sm text-gray-500 mb-4">Found {totalResults} results</p>}

          <FindInPageToolbar
            hasResults={results.length > 0}
            findQuery={findQuery}
            setFindQuery={setFindQuery}
            totalMatches={totalMatches}
            activeMatchIdx={activeMatchIdx}
            onNavigate={navigateFind}
          />

          {/* Results List */}
          <div className="space-y-6">
            {resultsWithOffsets.map((result) => (
              <div key={result.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xl font-medium text-blue-600 hover:underline line-clamp-1 block">
                  <HighlightText text={result.title} query={findQuery} matchOffset={result.titleOffset} activeMatchIdx={activeMatchIdx} />
                </a>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 mt-1 block truncate">
                  <HighlightText text={result.url} query={findQuery} matchOffset={result.urlOffset} activeMatchIdx={activeMatchIdx} />
                </a>
              </div>
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
}