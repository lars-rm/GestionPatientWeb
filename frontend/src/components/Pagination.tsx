import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400 gap-4">
      <div>
        Affichage de <span className="font-semibold text-gray-800 dark:text-white">{startIndex + 1}</span> à{' '}
        <span className="font-semibold text-gray-800 dark:text-white">
          {Math.min(startIndex + itemsPerPage, totalItems)}
        </span>{' '}
        sur <span className="font-semibold text-gray-800 dark:text-white">{totalItems}</span> résultats
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="px-3 py-1 font-medium text-gray-800 dark:text-white">
          Page {currentPage} sur {totalPages}
        </span>

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
