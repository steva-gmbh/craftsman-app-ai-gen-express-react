import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconEdit, IconTrash } from '../components/icons';
import { api } from '../services/api';
import { settingsService } from '../services/settingsService';
import { toast } from 'react-hot-toast';
import DataTable from '../components/DataTable';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import Dropdown from '../components/Dropdown';

// Define job types
const jobTypes = ['All', 'Renovation', 'Repair', 'Installation', 'Maintenance'];
const jobStatuses = ['All', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];

interface Job {
  id: number;
  customer: string;
  project: string;
  type: string;
  status: string;
  date: string;
  description: string;
}

export default function Jobs() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobToDelete, setJobToDelete] = useState<{ id: number; title: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtered data state
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
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
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        const [jobsResponse, customersResponse] = await Promise.all([
          api.getJobs({
            page: 1,
            limit: 1000 // Use a high limit to get all jobs
          }),
          api.getCustomers(),
        ]);

        // Map jobs to include customer information
        let mappedJobs = jobsResponse.data.map(job => {
          const customer = customersResponse.data.find(c => c.id === job.customerId);
          return {
            id: job.id,
            customer: customer?.name || 'Unknown',
            project: job.project?.name || 'None',
            type: job.title,
            status: job.status,
            date: new Date().toISOString().split('T')[0], // TODO: Add created_at to Job model
            description: job.description,
          };
        });

        return {
          ...jobsResponse,
          data: mappedJobs
        };
      } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
    },
  });

  // Apply filters and pagination whenever data, search query, or filters change
  useEffect(() => {
    if (!data?.data) return;
    
    let result = [...data.data];
    
    // Apply type filter
    if (selectedType !== 'All') {
      result = result.filter(job => job.type === selectedType);
    }
    
    // Apply status filter
    if (selectedStatus !== 'All') {
      result = result.filter(job => job.status === selectedStatus);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job =>
        job.customer.toLowerCase().includes(query) ||
        job.project.toLowerCase().includes(query) ||
        job.type.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
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
    setFilteredJobs(paginatedResult);
  }, [data?.data, selectedType, selectedStatus, searchQuery, rowsPerPage, currentPage]);

  const handleDelete = async () => {
    if (!jobToDelete) return;

    try {
      await api.deleteJob(jobToDelete.id);
      // Invalidate and refetch jobs to update the list
      await queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setJobToDelete(null);
      setDeleteError(null);
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Failed to delete job:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete job');
      toast.error('Failed to delete job');
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
    return <div>Loading jobs...</div>;
  }

  if (error) {
    return <div>Error loading jobs: {error.message}</div>;
  }

  const columns = [
    { header: 'Customer', accessor: 'customer' as keyof Job },
    { header: 'Project', accessor: 'project' as keyof Job },
    { header: 'Type', accessor: 'type' as keyof Job },
    {
      header: 'Status',
      accessor: (job: Job) => {
        const status = job.status.toLowerCase();
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status === 'completed' 
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' 
                : status === 'in_progress'
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
            }`}
          >
            {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </span>
        );
      }
    },
    { header: 'Date', accessor: 'date' as keyof Job },
    { header: 'Description', accessor: 'description' as keyof Job },
  ];

  return (
    <div className="h-full">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Jobs</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all jobs including their status and details.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/jobs/new')}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <IconPlus className="h-5 w-5 inline-block mr-2" stroke={1.5} />
            Add Job
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
            placeholder="Search jobs... (press Enter to search)"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Dropdown
            id="job-type"
            name="job-type"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
            options={jobTypes.map(type => ({
              value: type,
              label: type
            }))}
            label="Job Type"
          />
        </div>
        <div className="flex-1">
          <Dropdown
            id="job-status"
            name="job-status"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
            options={jobStatuses.map(status => ({
              value: status,
              label: status === 'All' ? status : status === 'IN_PROGRESS' ? 'In Progress' : status.charAt(0) + status.slice(1).toLowerCase()
            }))}
            label="Status"
          />
        </div>
      </div>

      {/* Jobs List */}
      <div className="mt-8 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <DataTable 
          columns={columns}
          data={filteredJobs}
          keyField="id"
          actions={(job) => (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <IconEdit className="h-5 w-5" />
                <span className="sr-only">Edit {job.type}</span>
              </button>
              <button
                onClick={() => setJobToDelete({ id: job.id, title: job.type })}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                <IconTrash className="h-5 w-5" />
                <span className="sr-only">Delete {job.type}</span>
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
        isOpen={jobToDelete !== null}
        title="Delete Job"
        message={jobToDelete ? `Are you sure you want to delete the job "${jobToDelete.title}"?` : ''}
        errorMessage={deleteError}
        onCancel={() => {
          setJobToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
