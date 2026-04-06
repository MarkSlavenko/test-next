import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls = memo(function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-between border-t pt-4">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex items-center gap-1 px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <ChevronLeft size={16} /> Previous
      </button>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 font-medium" aria-current="page">Page {currentPage} of {totalPages}</span>
        <div className="h-4 w-px bg-gray-300"></div>
        <div className="flex items-center gap-2">
          <label htmlFor="jumpPage" className="text-sm text-gray-600">Jump to:</label>
          <input
            id="jumpPage"
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value, 10);
              if (!isNaN(page) && page >= 1 && page <= totalPages) onPageChange(page);
            }}
            className="w-16 px-2 py-1 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-center transition-shadow"
          />
        </div>
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex items-center gap-1 px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
});