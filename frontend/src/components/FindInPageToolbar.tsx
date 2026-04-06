import { memo } from 'react';
import { ArrowDown, ArrowUp, SearchX } from 'lucide-react';

interface FindInPageToolbarProps {
  findQuery: string;
  setFindQuery: (query: string) => void;
  totalMatches: number;
  activeMatchIdx: number;
  onNavigate: (direction: 'next' | 'prev') => void;
  hasResults: boolean;
}

export const FindInPageToolbar = memo(function FindInPageToolbar({
  findQuery, setFindQuery, totalMatches, activeMatchIdx, onNavigate, hasResults
}: FindInPageToolbarProps) {
  if (!hasResults) return null;

  return (
    <div className="mb-6 flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm transition-all text-gray-900">
      <div className="flex items-center gap-3 w-full max-w-sm">
        <SearchX size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Find in results..."
          value={findQuery}
          onChange={(e) => setFindQuery(e.target.value)}
          className="outline-none text-sm bg-transparent w-full focus:ring-0"
          aria-label="Find in page"
        />
      </div>
      {findQuery && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
            {totalMatches > 0 ? `${activeMatchIdx + 1} of ${totalMatches}` : '0 of 0'}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => onNavigate('prev')}
              disabled={totalMatches === 0}
              aria-label="Previous match"
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ArrowUp size={16} />
            </button>
            <button
              onClick={() => onNavigate('next')}
              disabled={totalMatches === 0}
              aria-label="Next match"
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ArrowDown size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});