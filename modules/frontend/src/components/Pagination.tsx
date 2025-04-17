import React from 'react';
import { IconChevronLeft, IconChevronRight } from './icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Ensure totalPages is at least 1
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

  // Calculate visible page numbers
  const getVisiblePageNumbers = () => {
    const pages = [];

    // Always show the first page
    if (safeCurrentPage > 3) {
      pages.push(1);
    }

    // Show two pages before current page if they exist
    for (let i = Math.max(1, safeCurrentPage - 2); i < safeCurrentPage; i++) {
      pages.push(i);
    }

    // Show current page
    pages.push(safeCurrentPage);

    // Show two pages after current page if they exist
    for (let i = safeCurrentPage + 1; i <= Math.min(safeCurrentPage + 2, safeTotalPages); i++) {
      pages.push(i);
    }

    // Always show the last page
    if (safeCurrentPage < safeTotalPages - 2) {
      pages.push(safeTotalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePageNumbers();

  return (
    <nav className="flex items-center justify-between px-4 py-3 sm:px-6" aria-label="Pagination">
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700 dark:text-gray-400">
          Showing page <span className="font-medium">{safeCurrentPage}</span> of{' '}
          <span className="font-medium">{safeTotalPages}</span>
        </p>
      </div>
      <div className="flex flex-1 justify-center sm:justify-end">
        <div className="inline-flex items-center space-x-1">
          {/* First page button */}
          <button
            onClick={() => onPageChange(1)}
            disabled={safeCurrentPage === 1}
            className={`relative inline-flex items-center p-2 text-sm font-medium ${
              safeCurrentPage === 1
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            } rounded-md`}
            aria-label="First page"
          >
            <span className="sr-only">First page</span>
            <IconChevronLeft className="h-5 w-5" />
            <IconChevronLeft className="h-5 w-5 -ml-2" />
          </button>

          {/* Previous page button */}
          <button
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className={`relative inline-flex items-center p-2 text-sm font-medium ${
              safeCurrentPage === 1
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            } rounded-md`}
            aria-label="Previous page"
          >
            <span className="sr-only">Previous page</span>
            <IconChevronLeft className="h-5 w-5" />
          </button>

          {/* Page numbers */}
          {visiblePages.map((page, index) => (
            <React.Fragment key={page}>
              {/* Add ellipsis if there's a gap in page numbers */}
              {index > 0 && visiblePages[index - 1] !== page - 1 && (
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  ...
                </span>
              )}
              <button
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                  safeCurrentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                } rounded-md`}
                aria-current={safeCurrentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            </React.Fragment>
          ))}

          {/* Next page button */}
          <button
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === safeTotalPages}
            className={`relative inline-flex items-center p-2 text-sm font-medium ${
              safeCurrentPage === safeTotalPages
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            } rounded-md`}
            aria-label="Next page"
          >
            <span className="sr-only">Next page</span>
            <IconChevronRight className="h-5 w-5" />
          </button>

          {/* Last page button */}
          <button
            onClick={() => onPageChange(safeTotalPages)}
            disabled={safeCurrentPage === safeTotalPages}
            className={`relative inline-flex items-center p-2 text-sm font-medium ${
              safeCurrentPage === safeTotalPages
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            } rounded-md`}
            aria-label="Last page"
          >
            <span className="sr-only">Last page</span>
            <IconChevronRight className="h-5 w-5" />
            <IconChevronRight className="h-5 w-5 -ml-2" />
          </button>
        </div>
      </div>
    </nav>
  );
}
