import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconFilter, IconEdit, IconTrash } from '../components/icons';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import DataTable from '../components/DataTable';

// Update job types and statuses to match our database schema
const jobTypes = ['All', 'Website Redesign', 'Mobile App Development', 'Database Migration'];
const jobStatuses = ['All', 'pending', 'in progress', 'completed'];

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
  const [jobToDelete, setJobToDelete] = useState<{ id: number; title: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs', selectedType, selectedStatus],
    queryFn: async () => {
      const [jobs, customers] = await Promise.all([
        api.getJobs(),
        api.getCustomers(),
      ]);

      // Filter jobs based on selected type and status
      let filteredJobs = jobs;
      if (selectedType !== 'All') {
        filteredJobs = filteredJobs.filter(job => job.title === selectedType);
      }
      if (selectedStatus !== 'All') {
        filteredJobs = filteredJobs.filter(job => job.status === selectedStatus);
      }

      // Map jobs to include customer information
      return filteredJobs.map(job => {
        const customer = customers.find(c => c.id === job.customerId);
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
    },
  });

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
            {status.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="job-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Job Type
          </label>
          <select
            id="job-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            {jobTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="job-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            id="job-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            {jobStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs List */}
      <div className="mt-8 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <DataTable 
          columns={columns}
          data={jobs || []}
          keyField="id"
          actions={(job) => (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <IconEdit className="h-5 w-5" stroke={1.5} />
                <span className="sr-only">Edit {job.type}</span>
              </button>
              <button
                onClick={() => setJobToDelete({ id: job.id, title: job.type })}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                <IconTrash className="h-5 w-5" stroke={1.5} />
                <span className="sr-only">Delete {job.type}</span>
              </button>
            </div>
          )}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      {jobToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Job</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete the job "{jobToDelete.title}"?
            </p>
            {deleteError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{deleteError}</p>
            )}
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setJobToDelete(null);
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