import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconEdit, IconTrash, IconBriefcase } from '../components/icons';
import { api } from '../services/api';
import { settingsService } from '../services/settingsService';
import { toast } from 'react-hot-toast';
import DataTable from '../components/DataTable';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import Dropdown from '../components/Dropdown';

// Define status options
const projectStatuses = ['All', 'pending', 'active', 'completed', 'cancelled'];

interface Project {
  id: number;
  name: string;
  customer?: { name: string };
  customerId: number;
  status: string;
  jobCount: number;
  budget?: number;
}

export default function Projects() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [projectToDelete, setProjectToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtered data state
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
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

  // Get customers for the combobox
  const { data: customersResponse, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      return await api.getCustomers();
    },
  });

  // Access customers from the paginated response
  const customers = customersResponse?.data || [];

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const projectsResponse = await api.getProjects({
          page: 1,
          limit: 1000 // Use a high limit to get all projects
        });

        // Count jobs for each project
        const jobsResponse = await api.getJobs();
        const jobs = jobsResponse.data || [];

        let projects = projectsResponse.data.map(project => ({
          ...project,
          jobCount: jobs.filter(job => job.projectId === project.id).length
        }));

        return {
          ...projectsResponse,
          data: projects
        };
      } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
    },
  });

  // Apply filters and pagination whenever data, search query, or filters change
  useEffect(() => {
    if (!data?.data) return;
    
    let result = [...data.data];
    
    // Apply text search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(project =>
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );
    }

    // Apply customer filter
    if (selectedCustomer !== 'All') {
      result = result.filter(project =>
        project.customer?.name === selectedCustomer
      );
    }

    // Apply status filter
    if (selectedStatus !== 'All') {
      result = result.filter(project =>
        project.status === selectedStatus
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
    setFilteredProjects(paginatedResult);
  }, [data?.data, searchQuery, selectedCustomer, selectedStatus, rowsPerPage, currentPage]);

  const handleDelete = async () => {
    if (!projectToDelete) return;

    try {
      await api.deleteProject(projectToDelete.id);
      // Invalidate and refetch projects to update the list
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      setProjectToDelete(null);
      setDeleteError(null);
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Failed to delete project:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete project');
      toast.error('Failed to delete project');
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

  // Extract unique customer names for the dropdown
  const customerOptions = customers
    ? ['All', ...new Set(customers.map(customer => customer.name))]
    : ['All'];

  if (isLoading || isLoadingCustomers) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div>Error loading projects: {error.message}</div>;
  }

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Project },
    {
      header: 'Customer',
      accessor: (project: Project) => project.customer?.name || '-'
    },
    {
      header: 'Status',
      accessor: (project: Project) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            project.status === 'active' 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
              : project.status === 'completed'
              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
          }`}
        >
          {project.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </span>
      )
    },
    { header: 'Jobs', accessor: 'jobCount' as keyof Project },
    {
      header: 'Budget',
      accessor: (project: Project) => project.budget ? `$${project.budget.toFixed(2)}` : '-'
    },
  ];

  return (
    <div className="h-full">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Projects</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all projects including their details and associated jobs.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/projects/new')}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <IconPlus className="h-5 w-5 inline-block mr-2" />
            Add Project
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
            placeholder="Search projects... (press Enter to search)"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Dropdown
            id="customer-filter"
            name="customer-filter"
            value={selectedCustomer}
            onChange={(e) => {
              setSelectedCustomer(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
            options={customerOptions.map(customer => ({
              value: customer,
              label: customer
            }))}
            label="Customer"
          />
        </div>
        <div className="flex-1">
          <Dropdown
            id="status-filter"
            name="status-filter"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
            options={projectStatuses.map(status => ({
              value: status,
              label: status === 'All' ? status : status.charAt(0).toUpperCase() + status.slice(1)
            }))}
            label="Status"
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="mt-8 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <DataTable
          columns={columns}
          data={filteredProjects}
          keyField="id"
          actions={(project) => (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => navigate(`/projects/${project.id}`)}
                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <IconEdit className="h-5 w-5" />
                <span className="sr-only">Edit {project.name}</span>
              </button>
              <button
                onClick={() => navigate(`/jobs/new?customerId=${project.customerId}&projectId=${project.id}&returnToProject=true`)}
                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                title="Create new job for this project"
              >
                <IconBriefcase className="h-5 w-5" />
                <span className="sr-only">Create job for {project.name}</span>
              </button>
              <button
                onClick={() => setProjectToDelete({ id: project.id, name: project.name })}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                <IconTrash className="h-5 w-5" />
                <span className="sr-only">Delete {project.name}</span>
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
        isOpen={projectToDelete !== null}
        title="Delete Project"
        message={projectToDelete ? `Are you sure you want to delete the project "${projectToDelete.name}"?` : ''}
        errorMessage={deleteError}
        onCancel={() => {
          setProjectToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
