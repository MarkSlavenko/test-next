'use client';

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Loader2 } from 'lucide-react';

import { searchSchema, SearchFormValues, SearchHistoryItem } from '@/lib/api';
import { HighlightText } from './HighlightText';
import { HistorySidebar } from '@/components/HistorySidebar';
import { FindInPageToolbar } from '@/components/FindInPageToolbar';
import { PaginationControls } from '@/components/PaginationControls';
import { useSearch } from '@/hooks/useSearch';
import { useFindInPage } from '@/hooks/useFindInPage';

export default function SearchApp({ initialHistory }: { initialHistory: SearchHistoryItem[] }) {
  const {
    currentQuery,
    results,
    totalResults,
    currentPage,
    isLoading,
    error,
    ITEMS_PER_PAGE,
    performSearch,
  } = useSearch();

  const {
    findQuery,
    setFindQuery,
    activeMatchIdx,
    resultsWithOffsets,
    totalMatches,
    navigateFind,
    resetFind,
  } = useFindInPage(results);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: currentQuery },
  });

  const onSubmit = useCallback((data: SearchFormValues) => {
    resetFind();
    performSearch(data.query, true, 1);
  }, [performSearch, resetFind]);

  const handleHistoryClick = useCallback((query: string) => {
    setValue('query', query);
    resetFind();
    performSearch(query, false, 1);
  }, [performSearch, setValue, resetFind]);

  const handlePageChange = useCallback((newPage: number) => {
    resetFind();
    performSearch(currentQuery, false, newPage);
  }, [performSearch, currentQuery, resetFind]);

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
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg transition-all bg-white"
                aria-label="Search query"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Submit search"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} aria-hidden="true" /> : 'Search'}
              </button>
            </div>
            {errors.query && <p className="text-red-500 text-sm mt-2 absolute" role="alert">{errors.query.message}</p>}
          </form>

          {error && (
            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg" role="alert">
              {error}
            </div>
          )}

          {totalResults > 0 && !isLoading && (
            <p className="text-sm text-gray-500 mb-4" aria-live="polite">
              Found {totalResults} results
            </p>
          )}

          <FindInPageToolbar
            hasResults={results.length > 0}
            findQuery={findQuery}
            setFindQuery={setFindQuery}
            totalMatches={totalMatches}
            activeMatchIdx={activeMatchIdx}
            onNavigate={navigateFind}
          />

          {/* Results List */}
          <div className="space-y-6" aria-live="polite">
            {resultsWithOffsets.map((result) => (
              <div key={result.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xl font-medium text-blue-600 hover:underline line-clamp-1 block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
                  <HighlightText text={result.title} query={findQuery} matchOffset={result.titleOffset} activeMatchIdx={activeMatchIdx} />
                </a>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 mt-1 block truncate focus:outline-none focus:ring-2 focus:ring-green-500 rounded">
                  <HighlightText text={result.url} query={findQuery} matchOffset={result.urlOffset} activeMatchIdx={activeMatchIdx} />
                </a>
              </div>
            ))}

            {isLoading && results.length === 0 && (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            )}
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