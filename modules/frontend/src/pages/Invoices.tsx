import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, Invoice, PaginationParams } from '../services/api';
import { IconEdit, IconPlus, IconFilter, IconTrash } from '../components/icons';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import { toast } from 'react-hot-toast';
import './invoices.css'; // Will create this file later

interface Column {
  header: string;
  accessor: keyof Invoice | ((row: Invoice) => React.ReactNode);
  className?: string;
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, itemsPerPage]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const params: PaginationParams = {
        page: currentPage,
        limit: itemsPerPage,
      };
      const response = await api.getInvoices(params);
      setInvoices(response.data || []);
      setTotalItems(response.totalCount);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to fetch invoices');
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.deleteInvoice(id);
        toast.success('Invoice deleted successfully');
        fetchInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const columns: Column[] = [
    { header: 'Invoice #', accessor: 'invoiceNumber' },
    {
      header: 'Customer',
      accessor: (row: Invoice) => row.customer?.name || 'N/A',
    },
    {
      header: 'Issue Date',
      accessor: (row: Invoice) => 
        row.issueDate ? new Date(row.issueDate).toLocaleDateString() : 'N/A',
    },
    {
      header: 'Due Date',
      accessor: (row: Invoice) => 
        row.dueDate ? new Date(row.dueDate).toLocaleDateString() : 'N/A',
    },
    {
      header: 'Status',
      accessor: (row: Invoice) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(row.status)}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      header: 'Total Amount',
      accessor: (row: Invoice) => 
        `$${row.totalAmount.toFixed(2)}`,
    },
    // Add a view action column to navigate to the invoice
    {
      header: 'Actions',
      accessor: (row: Invoice) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => navigate(`/invoices/${row.id}/edit`)}
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            title="Edit"
          >
            <IconEdit className="h-5 w-5" />
            <span className="sr-only">Edit invoice #{row.invoiceNumber}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            title="Delete"
          >
            <IconTrash className="h-5 w-5" />
            <span className="sr-only">Delete invoice #{row.invoiceNumber}</span>
          </button>
        </div>
      ),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-200 text-gray-800';
      case 'sent':
        return 'bg-blue-200 text-blue-800';
      case 'paid':
        return 'bg-green-200 text-green-800';
      case 'overdue':
        return 'bg-red-200 text-red-800';
      case 'cancelled':
        return 'bg-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Invoices</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => {/* TODO: Add filter functionality */}}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <IconFilter size={18} className="mr-2" />
            Filter
          </button>
          <Link
            to="/invoices/new"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <IconPlus size={18} className="mr-2" />
            New Invoice
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="invoice-table-wrapper">
            <DataTable 
              columns={columns} 
              data={invoices} 
              keyField="id"
              isPaginated={false}
            />
          </div>
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Invoices; 