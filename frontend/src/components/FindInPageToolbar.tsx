import { ArrowDown, ArrowUp, SearchX } from 'lucide-react';

export const FindInPageToolbar = ({
                                    findQuery, setFindQuery, totalMatches, activeMatchIdx, onNavigate, hasResults
                                  }: any) => {
  if (!hasResults) return null;

  return (
    <div className="mb-6 flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm">
      <div className="flex items-center gap-3">
        <SearchX size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Find in results..."
          value={findQuery}
          onChange={(e) => setFindQuery(e.target.value)}
          className="outline-none text-sm bg-transparent"
        />
      </div>
      {findQuery && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium">
            {totalMatches > 0 ? `${activeMatchIdx + 1} of ${totalMatches}` : '0 of 0'}
          </span>
          <div className="flex gap-1">
            <button onClick={() => onNavigate('prev')} disabled={totalMatches === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 transition-colors">
              <ArrowUp size={16} />
            </button>
            <button onClick={() => onNavigate('next')} disabled={totalMatches === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 transition-colors">
              <ArrowDown size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};