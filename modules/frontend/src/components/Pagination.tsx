import React from 'react';
import { IconChevronLeft, IconChevronRight } from './icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Calculate visible page numbers
  const getVisiblePageNumbers = () => {
    const pages = [];
    
    // Always show the first page
    if (currentPage > 3) {
      pages.push(1);
    }
    
    // Show two pages before current page if they exist
    for (let i = Math.max(1, currentPage - 2); i < currentPage; i++) {
      pages.push(i);
    }
    
    // Show current page
    pages.push(currentPage);
    
    // Show two pages after current page if they exist
    for (let i = currentPage + 1; i <= Math.min(currentPage + 2, totalPages); i++) {
      pages.push(i);
    }
    
    // Always show the last page
    if (currentPage < totalPages - 2) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePageNumbers();

  return (
    <nav className="flex items-center justify-between px-4 py-3 sm:px-6" aria-label="Pagination">
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700 dark:text-gray-400">
          Showing page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </p>
      </div>
      <div className="flex flex-1 justify-center sm:justify-end">
        <div className="inline-flex items-center space-x-1">
          {/* First page button */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center p-2 text-sm font-medium ${
              currentPage === 1
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
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center p-2 text-sm font-medium ${
              currentPage === 1
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
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                } rounded-md`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            </React.Fragment>
          ))}

          {/* Next page button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center p-2 text-sm font-medium ${
              currentPage === totalPages
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
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center p-2 text-sm font-medium ${
              currentPage === totalPages
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