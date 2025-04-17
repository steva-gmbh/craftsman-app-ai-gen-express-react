import { ReactNode, useState, useEffect } from 'react';
import Pagination from './Pagination';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  actions?: (item: T) => ReactNode;
  // Pagination props
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isPaginated?: boolean;
  rowsPerPage?: number;
}

export default function DataTable<T>({
  columns,
  data,
  keyField,
  actions,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isPaginated = false,
  rowsPerPage
}: DataTableProps<T>) {
  // For client-side pagination when server pagination is not enabled
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState<T[]>(data);

  // Apply client-side pagination if not using server pagination
  useEffect(() => {
    if (!isPaginated || onPageChange) {
      // If server-side pagination is enabled, use the full data as is
      setPaginatedData(data);
      return;
    }

    // Otherwise, perform client-side pagination
    if (rowsPerPage && data.length > 0) {
      const startIndex = (localCurrentPage - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      setPaginatedData(data.slice(startIndex, endIndex));
    } else {
      setPaginatedData(data);
    }
  }, [data, localCurrentPage, isPaginated, onPageChange, rowsPerPage]);

  // Calculate total pages for client-side pagination
  const localTotalPages = rowsPerPage ? Math.ceil(data.length / rowsPerPage) : 1;

  // Handle page change for client-side pagination
  const handleLocalPageChange = (page: number) => {
    setLocalCurrentPage(page);
  };

  return (
    <div className="relative">
      <div className="overflow-x-auto w-full relative rounded-lg border border-gray-300 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`py-3.5 ${index === 0 ? 'pl-4 pr-3 sm:pl-6' : 'px-3'} text-left text-sm font-semibold text-gray-900 dark:text-white ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th className="sticky right-0 z-20 bg-gray-50 dark:bg-gray-700 py-3.5 pl-3 pr-4 sm:pr-6 shadow-[-8px_0_10px_-5px_rgba(0,0,0,0.15)] w-24 overflow-visible">
                  <span className="sr-only">Actions</span>
                  <div className="absolute left-0 top-0 bottom-0 border-l-2 border-gray-200 dark:border-gray-600 z-30"></div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
            {paginatedData.map((item) => (
              <tr key={String(item[keyField])}>
                {columns.map((column, index) => {
                  const value = typeof column.accessor === 'function'
                    ? column.accessor(item)
                    : String(item[column.accessor]);

                  return (
                    <td
                      key={index}
                      className={`whitespace-nowrap ${index === 0 ? 'py-4 pl-4 pr-3 sm:pl-6 font-medium text-gray-900 dark:text-white' : 'px-3 py-4 text-sm text-gray-500 dark:text-gray-400'} ${column.className || ''}`}
                    >
                      {value}
                    </td>
                  );
                })}
                {actions && (
                  <td className="sticky right-0 z-20 whitespace-nowrap bg-white dark:bg-gray-800 py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 shadow-[-8px_0_15px_-3px_rgba(0,0,0,0.2)] w-24 overflow-visible">
                    <div className="absolute left-0 top-0 bottom-0 border-l-2 border-gray-200 dark:border-gray-600 z-30"></div>
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {isPaginated && (
        <Pagination
          currentPage={onPageChange ? currentPage : localCurrentPage}
          totalPages={onPageChange ? totalPages : localTotalPages}
          onPageChange={onPageChange || handleLocalPageChange}
        />
      )}
    </div>
  );
}
