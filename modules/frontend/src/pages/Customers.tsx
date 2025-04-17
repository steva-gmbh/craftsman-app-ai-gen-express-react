import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconEdit, IconTrash } from '../components/icons';
import { api } from '../services/api';
import { settingsService } from '../services/settingsService';
import { toast } from 'react-hot-toast';
import DataTable from '../components/DataTable';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  billingAddress: string;
  jobs: number;
}

export default function Customers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerToDelete, setCustomerToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtered data state
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
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
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        // Get all customers
        let response = await api.getCustomers({
          page: 1,
          limit: 1000 // Use a high limit to get all customers
        });

        // Get all jobs to count for each customer
        const jobs = await api.getJobs();

        // Add job count to each customer
        const customersWithJobs = response.data.map(customer => ({
          ...customer,
          jobs: jobs.data ? jobs.data.filter(job => job.customerId === customer.id).length : 0
        }));

        return {
          ...response,
          data: customersWithJobs
        };
      } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
    },
  });

  // Apply filters and pagination whenever data, search query, or category changes
  useEffect(() => {
    if (!data?.data) return;
    
    let result = [...data.data];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchQuery.toLowerCase())
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
    setFilteredCustomers(paginatedResult);
  }, [data?.data, searchQuery, rowsPerPage, currentPage]);

  const handleDelete = async () => {
    if (!customerToDelete) return;

    try {
      await api.deleteCustomer(customerToDelete.id);
      // Invalidate and refetch customers to update the list
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      setCustomerToDelete(null);
      setDeleteError(null);
      toast.success('Customer deleted successfully');
    } catch (error) {
      console.error('Failed to delete customer:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete customer');
      toast.error('Failed to delete customer');
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
    return <div>Loading customers...</div>;
  }

  if (error) {
    return <div>Error loading customers: {error.message}</div>;
  }

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Customer },
    { header: 'Email', accessor: 'email' as keyof Customer },
    { header: 'Phone', accessor: 'phone' as keyof Customer },
    { header: 'Address', accessor: 'address' as keyof Customer },
  ];

  return (
    <div className="h-full">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Customers</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all customers including their contact information.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/customers/new')}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <IconPlus className="h-5 w-5 inline-block mr-2" />
            Add Customer
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
            placeholder="Search customers... (press Enter to search)"
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="mt-8 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <DataTable
          columns={columns}
          data={filteredCustomers}
          keyField="id"
          actions={(customer) => (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => navigate(`/customers/${customer.id}`)}
                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <IconEdit className="h-5 w-5" />
                <span className="sr-only">Edit {customer.name}</span>
              </button>
              <button
                onClick={() => setCustomerToDelete({ id: customer.id, name: customer.name })}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                <IconTrash className="h-5 w-5" />
                <span className="sr-only">Delete {customer.name}</span>
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
        isOpen={customerToDelete !== null}
        title="Delete Customer"
        message={customerToDelete ? `Are you sure you want to delete the customer "${customerToDelete.name}"?` : ''}
        errorMessage={deleteError}
        onCancel={() => {
          setCustomerToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
