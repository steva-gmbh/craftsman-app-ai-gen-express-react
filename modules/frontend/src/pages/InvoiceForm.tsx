import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Customer, Project } from '../services/api';
import { toast } from 'react-hot-toast';
import { IconPlus, IconTrash } from '../components/icons';

// Define a form state interface to use string dates for form inputs
interface InvoiceFormState {
  id?: number;
  invoiceNumber: string;
  issueDate: string; // Date as string for form inputs
  dueDate: string; // Date as string for form inputs
  status: string;
  totalAmount: number;
  taxRate: number;
  taxAmount: number;
  customerId: number;
  notes?: string;
  projectIds?: number[]; // Store just the IDs for API calls
}

const InvoiceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new' && !!id;
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<InvoiceFormState>({
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 30 days
    status: 'draft',
    totalAmount: 0,
    taxRate: 0,
    taxAmount: 0,
    customerId: 0,
    notes: '',
    projectIds: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch customers for the dropdown
        const customersResponse = await api.getCustomers();
        setCustomers(customersResponse.data || []);

        if (isEditMode) {
          // If editing, fetch the invoice data
          const invoice = await api.getInvoice(parseInt(id as string));

          setFormData({
            ...invoice,
            // Convert dates to string format for form inputs
            issueDate: invoice.issueDate instanceof Date
              ? invoice.issueDate.toISOString().split('T')[0]
              : new Date(invoice.issueDate).toISOString().split('T')[0],
            dueDate: invoice.dueDate instanceof Date
              ? invoice.dueDate.toISOString().split('T')[0]
              : new Date(invoice.dueDate).toISOString().split('T')[0],
            // Extract project IDs from the projects array
            projectIds: invoice.projects?.map(p => p.id) || []
          });

          // If customer is selected, fetch their projects
          if (invoice.customerId) {
            const projectsResponse = await api.getProjects();
            const customerProjects = (projectsResponse.data || []).filter(
              project => project.customerId === invoice.customerId
            );
            setAvailableProjects(customerProjects);

            // Set assigned projects
            if (invoice.projects && invoice.projects.length > 0) {
              setAssignedProjects(invoice.projects);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setError('Failed to load invoice data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  // When customer changes, fetch their projects
  useEffect(() => {
    const fetchCustomerProjects = async () => {
      if (formData.customerId) {
        try {
          const projectsResponse = await api.getProjects();
          const customerProjects = (projectsResponse.data || []).filter(
            project => project.customerId === formData.customerId
          );
          setAvailableProjects(customerProjects);

          // Filter assigned projects to only include this customer's projects
          if (assignedProjects.length > 0) {
            const filteredProjects = assignedProjects.filter(
              project => project.customerId === formData.customerId
            );
            setAssignedProjects(filteredProjects);
            setFormData(prev => ({
              ...prev,
              projectIds: filteredProjects.map(p => p.id)
            }));
          }
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      } else {
        setAvailableProjects([]);
        setAssignedProjects([]);
        setFormData(prev => ({ ...prev, projectIds: [] }));
      }
    };

    fetchCustomerProjects();
  }, [formData.customerId]);

  // Calculate tax amount when total amount or tax rate changes
  useEffect(() => {
    if (formData.totalAmount && formData.taxRate) {
      const taxAmount = formData.totalAmount * (formData.taxRate / 100);
      setFormData(prev => ({ ...prev, taxAmount }));
    }
  }, [formData.totalAmount, formData.taxRate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Convert number inputs to actual numbers
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditMode) {
        // Prepare update data with proper date objects for the API
        const updateData = {
          invoiceNumber: formData.invoiceNumber,
          status: formData.status,
          totalAmount: formData.totalAmount,
          taxRate: formData.taxRate,
          taxAmount: formData.taxAmount,
          customerId: formData.customerId,
          notes: formData.notes,
          projectIds: formData.projectIds,
        };

        await api.updateInvoice(parseInt(id as string), updateData);
        toast.success('Invoice updated successfully');
      } else {
        // Prepare create data with proper date objects for the API
        const createData = {
          invoiceNumber: formData.invoiceNumber,
          issueDate: new Date(formData.issueDate),
          dueDate: new Date(formData.dueDate),
          status: formData.status,
          totalAmount: formData.totalAmount,
          taxRate: formData.taxRate,
          taxAmount: formData.taxAmount,
          customerId: formData.customerId,
          notes: formData.notes,
          projectIds: formData.projectIds,
        };

        await api.createInvoice(createData);
        toast.success('Invoice created successfully');
      }

      navigate('/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
      setError('Failed to save invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProject = () => {
    if (!selectedProject) return;

    const projectId = parseInt(selectedProject);
    const projectToAdd = availableProjects.find(p => p.id === projectId);

    if (projectToAdd && !formData.projectIds?.includes(projectId)) {
      setAssignedProjects(prev => [...prev, projectToAdd]);
      setFormData(prev => ({
        ...prev,
        projectIds: [...(prev.projectIds || []), projectId]
      }));
      setSelectedProject('');
      toast.success('Project added');
    }
  };

  const handleRemoveProject = (projectId: number) => {
    setAssignedProjects(prev => prev.filter(p => p.id !== projectId));
    setFormData(prev => ({
      ...prev,
      projectIds: (prev.projectIds || []).filter(id => id !== projectId)
    }));
    toast.success('Project removed');
  };

  const handleCancel = () => {
    navigate('/invoices');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Invoice Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="invoiceNumber"
                    id="invoiceNumber"
                    value={formData.invoiceNumber || ''}
                    onChange={handleChange}
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer
                </label>
                <div className="mt-1">
                  <select
                    id="customerId"
                    name="customerId"
                    value={formData.customerId || ''}
                    onChange={handleChange}
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Issue Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="issueDate"
                    id="issueDate"
                    value={formData.issueDate}
                    onChange={handleChange}
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="dueDate"
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    name="status"
                    value={formData.status || 'draft'}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Amount (€)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="totalAmount"
                    id="totalAmount"
                    value={formData.totalAmount || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tax Rate (%)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="taxRate"
                    id="taxRate"
                    value={formData.taxRate || ''}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="taxAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tax Amount (€)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="taxAmount"
                    id="taxAmount"
                    value={formData.taxAmount?.toFixed(2) || '0.00'}
                    readOnly
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10 bg-gray-100 dark:bg-gray-600"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Projects Section */}
            {formData.customerId ? (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Projects</h2>

                <div className="flex gap-4">
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
                  >
                    <option value="">Select a project</option>
                    {availableProjects
                      .filter(project => !formData.projectIds?.includes(project.id))
                      .map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddProject}
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
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Project</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Budget</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                      {assignedProjects.length > 0 ? (
                        assignedProjects.map((project) => (
                          <tr key={project.id}>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {project.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {project.status}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {project.budget ? `€${project.budget.toFixed(2)}` : 'N/A'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              <button
                                type="button"
                                onClick={() => handleRemoveProject(project.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <IconTrash className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                            No projects assigned to this invoice yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Projects</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please select a customer to view available projects.
                </p>
              </div>
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
                {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Invoice' : 'Create Invoice')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
