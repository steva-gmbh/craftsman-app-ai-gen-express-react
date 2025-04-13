import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconPhone, IconMail, IconMapPin, IconEdit, IconTrash } from '../components/icons';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import DataTable from '../components/DataTable';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  jobs: number;
}

export default function Customers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [customerToDelete, setCustomerToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: async () => {
      const customers = await api.getCustomers();
      // Count jobs for each customer
      const jobs = await api.getJobs();
      return customers.map(customer => ({
        ...customer,
        jobs: jobs.filter(job => job.customerId === customer.id).length
      }));
    },
  });

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
          Search
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="search"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            placeholder="Search customers..."
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="mt-8 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <DataTable 
          columns={columns}
          data={customers || []}
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
        />
      </div>

      {/* Delete Confirmation Dialog */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Customer</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete the customer "{customerToDelete.name}"?
            </p>
            {deleteError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{deleteError}</p>
            )}
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setCustomerToDelete(null);
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
}
