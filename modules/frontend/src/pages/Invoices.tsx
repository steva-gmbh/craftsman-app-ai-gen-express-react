import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { IconEdit, IconPlus, IconFilter, IconTrash } from '../components/icons';
import { api, Invoice } from '../services/api';
import { settingsService } from '../services/settingsService';
import { toast } from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import './invoices.css'; // Will create this file later

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceToDelete, setInvoiceToDelete] = useState<{ id: number; invoiceNumber: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    queryKey: ['invoices', searchQuery, currentPage, rowsPerPage],
    queryFn: async () => {
      try {
        const params = {
          page: currentPage,
          limit: rowsPerPage
        };
        const response = await api.getInvoices(params);
        
        // Apply search filter if query exists
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const filteredInvoices = response.data.filter((invoice) => 
            invoice.invoiceNumber.toLowerCase().includes(query) ||
            (invoice.customer?.name && invoice.customer.name.toLowerCase().includes(query)) ||
            invoice.status.toLowerCase().includes(query)
          );
          
          return {
            ...response,
            data: filteredInvoices
          };
        }
        
        return response;
      } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }
    },
  });

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
    setCurrentPage(page);
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
            A list of all invoices including their details and payment status.
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
          data={data?.data || []}
          keyField="id"
          actions={(invoice) => (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <IconEdit className="h-5 w-5" />
                <span className="sr-only">Edit invoice #{invoice.invoiceNumber}</span>
              </button>
              <button
                onClick={() => setInvoiceToDelete({ id: invoice.id, invoiceNumber: invoice.invoiceNumber })}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                <IconTrash className="h-5 w-5" />
                <span className="sr-only">Delete invoice #{invoice.invoiceNumber}</span>
              </button>
            </div>
          )}
          totalCount={data?.totalCount || 0}
          currentPage={currentPage}
          totalPages={data?.totalPages || 1}
          onPageChange={handlePageChange}
          isPaginated={true}
          rowsPerPage={rowsPerPage}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      {invoiceToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Invoice</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete invoice "#{invoiceToDelete.invoiceNumber}"?
            </p>
            {deleteError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{deleteError}</p>
            )}
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setInvoiceToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices; 
