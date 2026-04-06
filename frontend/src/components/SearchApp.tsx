'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Loader2, Clock, ChevronLeft, ChevronRight, SearchX, ArrowUp, ArrowDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { HighlightText } from './HighlightText';

import { searchSchema, SearchFormValues, executeSearch, SearchResult, SearchHistoryItem } from '@/lib/api';

interface SearchAppProps {
  initialHistory: SearchHistoryItem[];
}

const ITEMS_PER_PAGE = 10;

export default function SearchApp({ initialHistory }: SearchAppProps) {
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [findQuery, setFindQuery] = useState('');
  const [activeMatchIdx, setActiveMatchIdx] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
  });

  const performSearch = async (query: string, saveToDb = false) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await executeSearch(query, saveToDb);
      setResults(data.results);
      setTotalResults(data.total);
      setCurrentPage(1);

      if (saveToDb) {
        router.refresh();
      }
    } catch (err) {
      setError('Failed to fetch results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: SearchFormValues) => {
    performSearch(data.query, true);
  };

  const handleHistoryClick = (query: string) => {
    setValue('query', query);
    performSearch(query, false);
  };

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const paginatedResults = results.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  let totalMatches = 0;
  const paginatedResultsWithOffsets = paginatedResults.map(result => {
    const titleMatches = findQuery ? (result.title.match(new RegExp(findQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'gi')) || []).length : 0;
    const urlMatches = findQuery ? (result.url.match(new RegExp(findQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'gi')) || []).length : 0;

    const item = {
      ...result,
      titleOffset: totalMatches,
      urlOffset: totalMatches + titleMatches,
    };

    totalMatches += titleMatches + urlMatches;
    return item;
  });

  const navigateFind = (direction: 'next' | 'prev') => {
    if (totalMatches === 0) return;

    let newIdx = activeMatchIdx;
    if (direction === 'next') {
      newIdx = (activeMatchIdx + 1) % totalMatches;
    } else {
      newIdx = (activeMatchIdx - 1 + totalMatches) % totalMatches;
    }

    setActiveMatchIdx(newIdx);

    // Smooth scroll to the active match
    setTimeout(() => {
      document.getElementById(`match-${newIdx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setActiveMatchIdx(0);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar - History */}
      <aside className="w-full md:w-64 bg-white border-r p-4 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold text-lg mb-4 text-gray-700">
          <Clock size={20} /> Query History
        </h2>
        <ul className="space-y-2">
          {initialHistory.slice(0, 10).map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleHistoryClick(item.query)}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors truncate"
              >
                {item.query}
              </button>
            </li>
          ))}
          {initialHistory.length === 0 && (
            <li className="text-sm text-gray-500 italic">No recent searches</li>
          )}
        </ul>
      </aside>

      {/* Main Content */}
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
            {errors.query && (
              <p className="text-red-500 text-sm mt-2 absolute">{errors.query.message}</p>
            )}
          </form>

          {/* Error & Meta info */}
          {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}

          {/* Find in Page Toolbar */}
          {results.length > 0 && (
            <div className="mb-6 flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm">
              <div className="flex items-center gap-3">
                <SearchX size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Find in results..."
                  value={findQuery}
                  onChange={(e) => {
                    setFindQuery(e.target.value);
                    setActiveMatchIdx(0);
                  }}
                  className="outline-none text-sm bg-transparent"
                />
              </div>
              {findQuery && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-medium">
                    {totalMatches > 0 ? `${activeMatchIdx + 1} of ${totalMatches}` : '0 of 0'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => navigateFind('prev')} disabled={totalMatches === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-50">
                      <ArrowUp size={16} />
                    </button>
                    <button onClick={() => navigateFind('next')} disabled={totalMatches === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-50">
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {totalResults > 0 && !isLoading && (
            <p className="text-sm text-gray-500 mb-4">
              Found {totalResults} results
            </p>
          )}

          {/* Results List */}
          <div className="space-y-6">
            {paginatedResultsWithOffsets.map((result, idx) => (
              <div key={idx} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-medium text-blue-600 hover:underline line-clamp-1 block"
                >
                  <HighlightText
                    text={result.title}
                    query={findQuery}
                    matchOffset={result.titleOffset}
                    activeMatchIdx={activeMatchIdx}
                  />
                </a>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 mt-1 block truncate">
                  <HighlightText
                    text={result.url}
                    query={findQuery}
                    matchOffset={result.urlOffset}
                    activeMatchIdx={activeMatchIdx}
                  />
                </a>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t pt-4">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
                className="flex items-center gap-1 px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <label htmlFor="jumpPage" className="text-sm text-gray-600">
                    Jump to:
                  </label>
                  <input
                    id="jumpPage"
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value, 10);
                      if (!isNaN(page) && page >= 1 && page <= totalPages) {
                        handlePageChange(page);
                      }
                    }}
                    className="w-16 px-2 py-1 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-center"
                  />
                </div>
              </div>

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
                className="flex items-center gap-1 px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}