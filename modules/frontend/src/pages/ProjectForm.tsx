import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IconPlus, IconEdit, IconTrash } from '../components/icons';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

export default function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    budget: '',
    startDate: '',
    endDate: '',
    customerId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<{ id: number; title: string } | null>(null);

  // Fetch customers for dropdown
  const { data: customersResponse} = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      return await api.getCustomers();
    },
  });

  // Get customers array from response
  const customers = customersResponse?.data || [];

  // Fetch jobs for this project
  const { data: projectJobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['jobs', 'project', id],
    queryFn: async () => {
      if (!id) return [];
      const allJobs = await api.getJobs();
      return allJobs.data.filter(job => job.projectId === Number(id));
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const project = await api.getProject(Number(id));
          setFormData({
            name: project.name,
            description: project.description,
            status: project.status,
            budget: project.budget ? project.budget.toString() : '',
            startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
            endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
            customerId: project.customerId ? project.customerId.toString() : '',
          });
        } catch (err) {
          setErrors({ general: 'Failed to load project data' });
          setShowErrors(true);
          console.error(err);
        }
      };

      fetchProject();
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateFormData = (data: typeof formData) => {
    const newErrors: Record<string, string> = {};
    
    if (!data.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!data.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!data.customerId) {
      newErrors.customerId = 'Customer is required';
    }
    
    if (data.budget && isNaN(parseFloat(data.budget))) {
      newErrors.budget = 'Budget must be a valid number';
    }
    
    if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      await api.deleteJob(jobToDelete.id);
      // Invalidate and refetch jobs to update the list
      await queryClient.invalidateQueries({ queryKey: ['jobs', 'project', id] });
      setJobToDelete(null);
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    
    // Validate the form data
    const isValid = validateFormData(formData);
    
    if (!isValid) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        customerId: parseInt(formData.customerId, 10),
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      };

      if (id) {
        await api.updateProject(Number(id), projectData);
        toast.success('Project updated successfully');
      } else {
        await api.createProject(projectData);
        toast.success('Project created successfully');
      }
      navigate('/projects');
    } catch (err) {
      setErrors({ 
        general: id ? 'Failed to update project. Please try again.' : 'Failed to create project. Please try again.' 
      });
      toast.error(id ? 'Failed to update project' : 'Failed to create project');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {id ? 'Edit Project' : 'Create New Project'}
      </h1>

      {Object.keys(errors).length > 0 && showErrors && errors.general && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
          {errors.general}
        </div>
      )}

      {Object.keys(errors).length > 0 && showErrors && !errors.general && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
          Please fix the errors below to continue.
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.name}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2`}
                  />
                  {showErrors && errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.description}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer
                </label>
                <div className="mt-1">
                  <div className="relative">
                    <select
                      id="customerId"
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full appearance-none sm:text-sm ${showErrors && errors.customerId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                    >
                      <option value="">Select Customer</option>
                      {customers?.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {showErrors && errors.customerId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.customerId}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <div className="mt-1">
                  <div className="relative">
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full appearance-none sm:text-sm ${showErrors && errors.status ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                    >
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {showErrors && errors.status && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.status}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Budget (€)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="budget"
                    id="budget"
                    step="0.01"
                    min="0"
                    value={formData.budget}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.budget ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.budget && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.budget}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.startDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.startDate}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.endDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.endDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Jobs List Section - Only show for existing projects */}
            {id && (
              <div className="space-y-4 mt-8">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Project Jobs</h2>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(`/jobs/new?customerId=${formData.customerId}&projectId=${id}&returnToProject=true`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
                  >
                    <IconPlus className="h-5 w-5 mr-2" />
                    Add Job
                  </button>
                </div>

                {isLoadingJobs ? (
                  <div>Loading jobs...</div>
                ) : projectJobs && projectJobs.length > 0 ? (
                  <div className="mt-4">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Title</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Price</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Start Date</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">End Date</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                        {projectJobs.map((job) => (
                          <tr key={job.id}>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {job.title}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  job.status === 'PENDING'
                                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                                    : job.status === 'COMPLETED'
                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                                    : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                                }`}
                              >
                                {job.status === 'PENDING'
                                  ? 'Pending'
                                  : job.status === 'IN_PROGRESS'
                                  ? 'In Progress'
                                  : 'Completed'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {job.price ? `€${job.price.toFixed(2)}` : '-'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {job.startDate ? new Date(job.startDate).toLocaleDateString() : '-'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {job.endDate ? new Date(job.endDate).toLocaleDateString() : '-'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => navigate(`/jobs/${job.id}?returnToProject=true`)}
                                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                  <IconEdit className="h-5 w-5" />
                                  <span className="sr-only">Edit {job.title}</span>
                                </button>
                                <button
                                  onClick={() => setJobToDelete({ id: job.id, title: job.title })}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <IconTrash className="h-5 w-5" />
                                  <span className="sr-only">Delete {job.title}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No jobs found for this project. Add your first job to get started.
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 h-10"
              >
                {isSubmitting ? 'Saving...' : 'Save Project'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Job Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={jobToDelete !== null}
        title="Delete Job"
        message={jobToDelete ? `Are you sure you want to delete the job "${jobToDelete.title}"? This action cannot be undone.` : ''}
        errorMessage={null}
        onCancel={() => setJobToDelete(null)}
        onConfirm={handleDeleteJob}
      />
    </div>
  );
}
