import { SearchHistoryItem } from '@/lib/api';
import { Clock } from 'lucide-react';

export const HistorySidebar = ({ history, onSelect }: { history: SearchHistoryItem[], onSelect: (q: string) => void }) => (
  <aside className="w-full md:w-64 bg-white border-r p-4 shadow-sm">
    <h2 className="flex items-center gap-2 font-semibold text-lg mb-4 text-gray-700">
      <Clock size={20} /> Query History
    </h2>
    <ul className="space-y-2">
      {history.slice(0, 10).map((item) => (
        <li key={item.id}>
          <button
            onClick={() => onSelect(item.query)}
            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors truncate"
          >
            {item.query}
          </button>
        </li>
      ))}
      {history.length === 0 && <li className="text-sm text-gray-500 italic">No recent searches</li>}
    </ul>
  </aside>
);