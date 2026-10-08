import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./Button";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  options?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onLimitChange,
  options = [5, 10, 25, 50, 100, 200],
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Determine the start and end of the currently visible items
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              onLimitChange(Number(e.target.value));
              onPageChange(1); // Reset to first page on limit change
            }}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-1 pl-2 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>
        <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-900 dark:text-white">{startItem}</span> to{" "}
          <span className="font-semibold text-slate-900 dark:text-white">{endItem}</span> of{" "}
          <span className="font-semibold text-slate-900 dark:text-white">{totalItems}</span> entries
        </div>
      </div>

      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-1">
        <button
          className="flex items-center justify-center px-3 h-8 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors disabled:opacity-50 disabled:pointer-events-none hidden sm:flex"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>
        <button
          className="flex items-center justify-center w-8 h-8 text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors disabled:opacity-50 disabled:pointer-events-none sm:hidden"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <div
                key={`ellipsis-${idx}`}
                className="flex items-center justify-center w-8 h-8 text-slate-400"
              >
                <MoreHorizontal className="w-4 h-4" />
              </div>
            ) : (
              <button
                key={`page-${page}`}
                className={`flex items-center justify-center w-8 h-8 text-xs font-medium rounded transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          className="flex items-center justify-center px-3 h-8 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors disabled:opacity-50 disabled:pointer-events-none hidden sm:flex"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
        <button
          className="flex items-center justify-center w-8 h-8 text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors disabled:opacity-50 disabled:pointer-events-none sm:hidden"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Mobile only entries info */}
      <div className="block sm:hidden text-xs text-slate-500 dark:text-slate-400 w-full text-center mt-2">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
    </div>
  );
};
