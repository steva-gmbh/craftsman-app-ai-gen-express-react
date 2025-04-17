import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { IconEdit, IconPlus, IconTrash, IconFileDownload } from '../components/icons';
import { api, Invoice } from '../services/api';
import { settingsService } from '../services/settingsService';
import { toast } from 'react-hot-toast';
import DataTable from '../components/DataTable';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceToDelete, setInvoiceToDelete] = useState<{ id: number; invoiceNumber: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filtered data state
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [filteredTotalCount, setFilteredTotalCount] = useState(0);
  const [filteredTotalPages, setFilteredTotalPages] = useState(1);

  // Load rows per page from user settings
  useEffect(() => {
    const loadRowsPerPage = async () => {
      try {
        const perPage = await settingsService.getRowsPerPage();
        setRowsPerPage(perPage);
      } catch (error) {
        console.error('Error loading rows per page setting:', error);
      }
    };

    loadRowsPerPage();
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      try {
        // Fetch all invoices without pagination to handle client-side filtering/pagination properly
        const response = await api.getInvoices({
          page: 1,
          limit: 1000 // Use a high limit to get all invoices
        });
        return response;
      } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }
    },
  });

  // Apply filters and pagination whenever data or search query changes
  useEffect(() => {
    if (!data?.data) return;
    
    let result = [...data.data];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        (invoice.customer?.name && invoice.customer.name.toLowerCase().includes(query)) ||
        invoice.status.toLowerCase().includes(query)
      );
    }
    
    // Update filtered data and pagination info
    const filteredCount = result.length;
    const filteredPages = Math.max(1, Math.ceil(filteredCount / rowsPerPage));
    
    setFilteredTotalCount(filteredCount);
    setFilteredTotalPages(filteredPages);
    
    // Make sure we don't exceed the total number of pages
    const validCurrentPage = Math.min(currentPage, filteredPages);
    
    // Apply pagination to the filtered results
    const startIndex = (validCurrentPage - 1) * rowsPerPage;
    const paginatedResult = result.slice(startIndex, startIndex + rowsPerPage);
    setFilteredInvoices(paginatedResult);
  }, [data?.data, searchQuery, rowsPerPage, currentPage]);

  const handleDelete = async () => {
    if (!invoiceToDelete) return;

    try {
      await api.deleteInvoice(invoiceToDelete.id);
      // Invalidate and refetch invoices to update the list
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setInvoiceToDelete(null);
      setDeleteError(null);
      toast.success('Invoice deleted successfully');
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete invoice');
      toast.error('Failed to delete invoice');
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
      setCurrentPage(1); // Reset to first page on new search
    }
  };

  const handlePageChange = (page: number) => {
    // Only update the page if it's different from the current page
    // and within the valid range
    if (page !== currentPage && page >= 1 && page <= filteredTotalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoading) {
    return <div>Loading invoices...</div>;
  }

  if (error) {
    return <div>Error loading invoices: {error.message}</div>;
  }

  const columns = [
    { header: 'Invoice #', accessor: 'invoiceNumber' as keyof Invoice },
    {
      header: 'Customer',
      accessor: (invoice: Invoice) => invoice.customer?.name || 'N/A'
    },
    {
      header: 'Issue Date',
      accessor: (invoice: Invoice) =>
        invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A'
    },
    {
      header: 'Due Date',
      accessor: (invoice: Invoice) =>
        invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'
    },
    {
      header: 'Status',
      accessor: (invoice: Invoice) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}
        >
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </span>
      )
    },
    {
      header: 'Total Amount',
      accessor: (invoice: Invoice) =>
        `$${invoice.totalAmount.toFixed(2)}`
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
      case 'sent':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'cancelled':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="h-full">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Invoices</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all invoices including customer information, dates and payment status.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/invoices/new')}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <IconPlus className="h-5 w-5 inline-block mr-2" />
            Add Invoice
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Search (press Enter to search)
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="search"
            id="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearch}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            placeholder="Search invoices... (press Enter to search)"
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="mt-8 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <DataTable
          columns={columns}
          data={filteredInvoices}
          keyField="id"
          actions={(invoice) => (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                title="Edit invoice"
              >
                <IconEdit className="h-5 w-5" />
                <span className="sr-only">Edit invoice #{invoice.invoiceNumber}</span>
              </button>
              <button
                onClick={() => {
                  toast.promise(
                    api.downloadInvoicePdf(invoice.id),
                    {
                      loading: 'Generating PDF...',
                      success: 'PDF downloaded successfully',
                      error: 'Failed to download PDF'
                    }
                  );
                }}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                title="Download PDF"
              >
                <IconFileDownload className="h-5 w-5" />
                <span className="sr-only">Download PDF for invoice #{invoice.invoiceNumber}</span>
              </button>
              <button
                onClick={() => setInvoiceToDelete({ id: invoice.id, invoiceNumber: invoice.invoiceNumber })}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                title="Delete invoice"
              >
                <IconTrash className="h-5 w-5" />
                <span className="sr-only">Delete invoice #{invoice.invoiceNumber}</span>
              </button>
            </div>
          )}
          totalCount={filteredTotalCount}
          currentPage={currentPage}
          totalPages={filteredTotalPages}
          onPageChange={handlePageChange}
          isPaginated={true}
          rowsPerPage={rowsPerPage}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={invoiceToDelete !== null}
        title="Delete Invoice"
        message={invoiceToDelete ? `Are you sure you want to delete invoice "#${invoiceToDelete.invoiceNumber}"?` : ''}
        errorMessage={deleteError}
        onCancel={() => {
          setInvoiceToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Invoices;
