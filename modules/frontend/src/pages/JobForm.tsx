import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, Customer, Material, JobMaterial } from '../services/api';
import { toast } from 'react-hot-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function JobForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
    customerId: '',
    price: '',
    startDate: '',
    endDate: '',
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [materialAmount, setMaterialAmount] = useState<string>('');

  const { data: materials } = useQuery({
    queryKey: ['materials'],
    queryFn: api.getMaterials,
  });

  const { data: jobMaterials } = useQuery({
    queryKey: ['jobMaterials', id],
    queryFn: () => id ? api.getJobMaterials(Number(id)) : [],
    enabled: !!id,
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersData = await api.getCustomers();
        setCustomers(customersData);
      } catch (err) {
        setError('Failed to load customers');
        console.error(err);
      }
    };

    fetchCustomers();

    if (id) {
      const fetchJob = async () => {
        try {
          const jobs = await api.getJobs();
          const job = jobs.find(j => j.id === Number(id));
          if (job) {
            setFormData({
              title: job.title,
              description: job.description,
              status: job.status,
              customerId: job.customerId.toString(),
              price: job.price?.toString() || '',
              startDate: job.startDate?.toISOString().split('T')[0] || '',
              endDate: job.endDate?.toISOString().split('T')[0] || '',
            });
          } else {
            setError('Job not found');
          }
        } catch (err) {
          setError('Failed to load job data');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        customerId: Number(formData.customerId),
        price: formData.price ? Number(formData.price) : undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      };

      if (id) {
        await api.updateJob(Number(id), jobData);
        toast.success('Job updated successfully');
        navigate('/jobs');
      } else {
        const newJob = await api.createJob(jobData);
        toast.success('Job created successfully');
        navigate('/jobs');
      }
    } catch (err) {
      setError('Failed to save job. Please try again.');
      toast.error(id ? 'Failed to update job' : 'Failed to create job');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {id ? 'Edit Job' : 'Add New Job'}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Customer
          </label>
          <select
            name="customerId"
            id="customerId"
            required
            value={formData.customerId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            name="status"
            id="status"
            required
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Price (€)
          </label>
          <input
            type="number"
            name="price"
            id="price"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            />
          </div>
        </div>

        {id && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Materials</h2>
            
            <div className="flex gap-4">
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
              >
                <option value="">Select a material</option>
                {materials?.map(material => (
                  <option key={material.id} value={material.id}>
                    {material.name} ({material.unit})
                  </option>
                ))}
              </select>
              
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
                <PlusIcon className="h-5 w-5 mr-2" />
                Add
              </button>
            </div>

            <div className="mt-4">
              <table className="min-w-full divide-y divide-gray-300">
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
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/jobs')}
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
      </form>
    </div>
  );
} 