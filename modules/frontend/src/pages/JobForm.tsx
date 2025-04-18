import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { IconPlus, IconTrash } from '../components/icons';

export default function JobForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const prefilledCustomerId = queryParams.get('customerId');
  const prefilledProjectId = queryParams.get('projectId');
  const returnToProject = prefilledProjectId || (queryParams.get('returnToProject') === 'true');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
    customerId: prefilledCustomerId || '',
    projectId: prefilledProjectId || '',
    price: '',
    startDate: '',
    endDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [materialAmount, setMaterialAmount] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [toolAmount, setToolAmount] = useState<string>('');

  // Fetch customers
  const { data: customersResponse} = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      return await api.getCustomers();
    },
  });

  // Get customers array from response
  const customers = customersResponse?.data || [];

  // Fetch projects
  const { data: projectsResponse} = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      return await api.getProjects();
    },
  });

  // Get projects array from response
  const projects = projectsResponse?.data || [];

  // Fetch materials
  const { data: materialsResponse} = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      return await api.getMaterials();
    },
  });

  // Get materials array from response
  const materials = materialsResponse?.data || [];

  // Fetch tools
  const { data: toolsResponse} = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      return await api.getTools();
    },
  });

  // Get tools array from response
  const tools = toolsResponse?.data || [];

  const { data: jobMaterials } = useQuery({
    queryKey: ['jobMaterials', id],
    queryFn: () => id ? api.getJobMaterials(Number(id)) : [],
    enabled: !!id,
  });

  const { data: jobTools } = useQuery({
    queryKey: ['jobTools', id],
    queryFn: () => id ? api.getJobTools(Number(id)) : [],
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      const fetchJob = async () => {
        try {
          const job = await api.getJob(Number(id));
          setFormData({
            title: job.title,
            description: job.description,
            status: job.status,
            customerId: job.customerId.toString(),
            projectId: job.projectId ? job.projectId.toString() : '',
            price: job.price?.toString() || '',
            startDate: job.startDate ? new Date(job.startDate).toISOString().split('T')[0] : '',
            endDate: job.endDate ? new Date(job.endDate).toISOString().split('T')[0] : '',
          });
        } catch (err) {
          setErrors({ general: 'Failed to load job data' });
          setShowErrors(true);
          console.error(err);
        }
      };

      fetchJob();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    
    if (!data.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!data.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!data.customerId) {
      newErrors.customerId = 'Customer is required';
    }
    
    if (data.price && isNaN(parseFloat(data.price))) {
      newErrors.price = 'Price must be a valid number';
    }
    
    if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMaterial = async () => {
    if (!selectedMaterial || !materialAmount || !id) return;

    try {
      await api.addJobMaterial(Number(id), Number(selectedMaterial), Number(materialAmount));
      await queryClient.invalidateQueries({ queryKey: ['jobMaterials', id] });
      setSelectedMaterial('');
      setMaterialAmount('');
      toast.success('Material added successfully');
    } catch (err) {
      toast.error('Failed to add material');
      console.error(err);
    }
  };

  const handleUpdateMaterial = async (materialId: number, newAmount: number) => {
    if (!id) return;

    try {
      await api.updateJobMaterial(Number(id), materialId, newAmount);
      await queryClient.invalidateQueries({ queryKey: ['jobMaterials', id] });
      toast.success('Material updated successfully');
    } catch (err) {
      toast.error('Failed to update material');
      console.error(err);
    }
  };

  const handleRemoveMaterial = async (materialId: number) => {
    if (!id) return;

    try {
      await api.removeJobMaterial(Number(id), materialId);
      await queryClient.invalidateQueries({ queryKey: ['jobMaterials', id] });
      toast.success('Material removed successfully');
    } catch (err) {
      toast.error('Failed to remove material');
      console.error(err);
    }
  };

  const handleAddTool = async () => {
    if (!selectedTool || !toolAmount || !id) return;

    try {
      await api.addJobTool(Number(id), Number(selectedTool), Number(toolAmount));
      await queryClient.invalidateQueries({ queryKey: ['jobTools', id] });
      setSelectedTool('');
      setToolAmount('');
      toast.success('Tool added successfully');
    } catch (err) {
      toast.error('Failed to add tool');
      console.error(err);
    }
  };

  const handleUpdateTool = async (toolId: number, newAmount: number) => {
    if (!id) return;

    try {
      await api.updateJobTool(Number(id), toolId, newAmount);
      await queryClient.invalidateQueries({ queryKey: ['jobTools', id] });
      toast.success('Tool updated successfully');
    } catch (err) {
      toast.error('Failed to update tool');
      console.error(err);
    }
  };

  const handleRemoveTool = async (toolId: number) => {
    if (!id) return;

    try {
      await api.removeJobTool(Number(id), toolId);
      await queryClient.invalidateQueries({ queryKey: ['jobTools', id] });
      toast.success('Tool removed successfully');
    } catch (err) {
      toast.error('Failed to remove tool');
      console.error(err);
    }
  };

  const handleCancel = () => {
    if (returnToProject) {
      // If we came from a project, return to that project's edit page
      navigate(`/projects/${formData.projectId || prefilledProjectId}`);
    } else {
      // Otherwise, return to the jobs list
      navigate('/jobs');
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
      const jobData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        customerId: Number(formData.customerId),
        projectId: formData.projectId ? Number(formData.projectId) : undefined,
        price: formData.price ? Number(formData.price) : undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      };

      if (id) {
        await api.updateJob(Number(id), jobData);
        toast.success('Job updated successfully');

        // After updating, navigate back to the appropriate page
        if (returnToProject) {
          await queryClient.invalidateQueries({ queryKey: ['jobs', 'project', formData.projectId || prefilledProjectId] });
          navigate(`/projects/${formData.projectId || prefilledProjectId}`);
        } else {
          navigate('/jobs');
        }
      } else {
        await api.createJob(jobData);
        toast.success('Job created successfully');

        // After creating, navigate back to the appropriate page
        if (returnToProject) {
          await queryClient.invalidateQueries({ queryKey: ['jobs', 'project', formData.projectId || prefilledProjectId] });
          navigate(`/projects/${formData.projectId || prefilledProjectId}`);
        } else {
          navigate('/jobs');
        }
      }
    } catch (err) {
      setErrors({ general: 'Failed to save job. Please try again.' });
      toast.error(id ? 'Failed to update job' : 'Failed to create job');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {id ? 'Edit Job' : 'Create New Job'}
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
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.title}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
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
                      <option value="">Select a customer</option>
                      {customers.map(customer => (
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
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project (Optional)
                </label>
                <div className="mt-1">
                  <div className="relative">
                    <select
                      id="projectId"
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full appearance-none sm:text-sm ${showErrors && errors.projectId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                    >
                      <option value="">None</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {showErrors && errors.projectId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.projectId}</p>
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
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
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
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price (€)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="price"
                    id="price"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.price && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.price}</p>
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

            {id && (
              <>
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Materials</h2>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <select
                          value={selectedMaterial}
                          onChange={(e) => setSelectedMaterial(e.target.value)}
                          className="flex-1 w-full appearance-none rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
                        >
                          <option value="">Select a material</option>
                          {materials?.map(material => (
                            <option key={material.id} value={material.id}>
                              {material.name} ({material.unit})
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <input
                      type="number"
                      value={materialAmount}
                      onChange={(e) => setMaterialAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-32 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
                    />

                    <button
                      type="button"
                      onClick={handleAddMaterial}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
                    >
                      <IconPlus className="h-5 w-5 mr-2" />
                      Add
                    </button>
                  </div>

                  <div className="mt-4">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Material</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Unit</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                        {jobMaterials?.map((jobMaterial) => (
                          <tr key={jobMaterial.id}>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {jobMaterial.material.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              <input
                                type="number"
                                value={jobMaterial.amount}
                                onChange={(e) => handleUpdateMaterial(jobMaterial.materialId, Number(e.target.value))}
                                className="w-24 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-8"
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {jobMaterial.material.unit}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              <button
                                type="button"
                                onClick={() => handleRemoveMaterial(jobMaterial.materialId)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <IconTrash className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4 mt-8">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Tools</h2>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <select
                          value={selectedTool}
                          onChange={(e) => setSelectedTool(e.target.value)}
                          className="flex-1 w-full appearance-none rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
                        >
                          <option value="">Select a tool</option>
                          {tools?.map(tool => (
                            <option key={tool.id} value={tool.id}>
                              {tool.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <input
                      type="number"
                      value={toolAmount}
                      onChange={(e) => setToolAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-32 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
                    />

                    <button
                      type="button"
                      onClick={handleAddTool}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
                    >
                      <IconPlus className="h-5 w-5 mr-2" />
                      Add
                    </button>
                  </div>

                  <div className="mt-4">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Tool</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Category</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                        {jobTools?.map((jobTool) => (
                          <tr key={jobTool.id}>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {jobTool.tool.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              <input
                                type="number"
                                value={jobTool.amount}
                                onChange={(e) => handleUpdateTool(jobTool.toolId, Number(e.target.value))}
                                className="w-24 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-8"
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {jobTool.tool.category}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              <button
                                type="button"
                                onClick={() => handleRemoveTool(jobTool.toolId)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <IconTrash className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 h-10"
              >
                {isSubmitting ? 'Saving...' : 'Save Job'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
