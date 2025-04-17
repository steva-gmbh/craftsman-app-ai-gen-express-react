import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { api } from '../services/api';
import { settingsService } from '../services/settingsService';
import { toast } from 'react-hot-toast';
import DataTable from '../components/DataTable';
import { Vehicle } from '../services/api';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

export default function Vehicles() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('');
  const [vehicleToDelete, setVehicleToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtered data state
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [filteredTotalCount, setFilteredTotalCount] = useState(0);
  const [filteredTotalPages, setFilteredTotalPages] = useState(1);

  // Vehicle type options
  const vehicleTypes = [
    { value: '', label: 'All Types' },
    { value: 'car', label: 'Car' },
    { value: 'truck', label: 'Truck' },
    { value: 'van', label: 'Van' },
    { value: 'suv', label: 'SUV' },
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'other', label: 'Other' }
  ];

  // Vehicle status options
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'retired', label: 'Retired' }
  ];

  // Fuel type options
  const fuelTypeOptions = [
    { value: '', label: 'All Fuel Types' },
    { value: 'gasoline', label: 'Gasoline' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'other', label: 'Other' }
  ];

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, fuelTypeFilter]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      try {
        // Get all vehicles
        const response = await api.getVehicles({
          page: 1,
          limit: 1000 // Use a high limit to get all vehicles
        });

        return response;
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        throw error;
      }
    },
  });

  // Apply filters and pagination whenever data, search query, or filters change
  useEffect(() => {
    if (!data?.data) return;

    let result = [...data.data];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((vehicle: Vehicle) =>
        vehicle.name.toLowerCase().includes(query) ||
        vehicle.make.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.licensePlate?.toLowerCase().includes(query) ||
        vehicle.type.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter((vehicle: Vehicle) =>
        vehicle.status === statusFilter
      );
    }

    // Apply type filter
    if (typeFilter) {
      result = result.filter((vehicle: Vehicle) =>
        vehicle.type === typeFilter
      );
    }

    // Apply fuel type filter
    if (fuelTypeFilter) {
      result = result.filter((vehicle: Vehicle) =>
        vehicle.fuelType === fuelTypeFilter
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
    setFilteredVehicles(paginatedResult);
  }, [data?.data, searchQuery, statusFilter, typeFilter, fuelTypeFilter, rowsPerPage, currentPage]);

  const handleDelete = async () => {
    if (!vehicleToDelete) return;

    try {
      await api.deleteVehicle(vehicleToDelete.id);
      // Invalidate and refetch vehicles to update the list
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setVehicleToDelete(null);
      setDeleteError(null);
      toast.success('Vehicle deleted successfully');
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete vehicle');
      toast.error('Failed to delete vehicle');
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
    return <div>Loading vehicles...</div>;
  }

  if (error) {
    return <div>Error loading vehicles: {(error as Error).message}</div>;
  }

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Vehicle },
    { header: 'Make', accessor: 'make' as keyof Vehicle },
    { header: 'Model', accessor: 'model' as keyof Vehicle },
    { header: 'Year', accessor: 'year' as keyof Vehicle },
    {
      header: 'Type',
      accessor: (vehicle: Vehicle) => {
        return vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1);
      }
    },
    {
      header: 'Status',
      accessor: (vehicle: Vehicle) => {
        const statusColors = {
          active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
          retired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };

        const color = statusColors[vehicle.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        const displayStatus = vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1);

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {displayStatus}
          </span>
        );
      }
    },
  ];

  return (
    <div className="h-full">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Vehicles</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all vehicles including their details.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/vehicles/new')}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <IconPlus className="h-5 w-5 inline-block mr-2" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Search */}
        <div>
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
              placeholder="Search vehicles..."
            />
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Type
          </label>
          <div className="mt-1 relative">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full appearance-none rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              {vehicleTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <div className="mt-1 relative">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full appearance-none rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fuel Type Filter */}
        <div>
          <label htmlFor="fuel-type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Fuel Type
          </label>
          <div className="mt-1 relative">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <select
              id="fuel-type-filter"
              value={fuelTypeFilter}
              onChange={(e) => setFuelTypeFilter(e.target.value)}
              className="block w-full appearance-none rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              {fuelTypeOptions.map((fuel) => (
                <option key={fuel.value} value={fuel.value}>
                  {fuel.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles List */}
      <div className="mt-8 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <DataTable
          columns={columns}
          data={filteredVehicles}
          keyField="id"
          actions={(vehicle) => (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <IconEdit className="h-5 w-5" />
                <span className="sr-only">Edit {vehicle.name}</span>
              </button>
              <button
                onClick={() => setVehicleToDelete({ id: vehicle.id, name: vehicle.name })}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                <IconTrash className="h-5 w-5" />
                <span className="sr-only">Delete {vehicle.name}</span>
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
        isOpen={vehicleToDelete !== null}
        title="Delete Vehicle"
        message={vehicleToDelete ? `Are you sure you want to delete the vehicle "${vehicleToDelete.name}"?` : ''}
        errorMessage={deleteError}
        onCancel={() => {
          setVehicleToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
