import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Invoice, Customer, Project } from '../services/api';
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Invoice Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer
            </label>
            <select
              name="customerId"
              value={formData.customerId || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Issue Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status || 'draft'}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Amount
            </label>
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          {/* Tax Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              name="taxRate"
              value={formData.taxRate || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
              max="100"
              step="0.01"
            />
          </div>
          
          {/* Tax Amount (calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tax Amount
            </label>
            <input
              type="number"
              name="taxAmount"
              value={formData.taxAmount?.toFixed(2) || '0.00'}
              readOnly
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600"
            />
          </div>
        </div>
        
        {/* Projects */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Projects
          </label>
          {formData.customerId ? (
            <>
              <div className="flex gap-4 mb-4">
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

              {assignedProjects.length > 0 ? (
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
                      {assignedProjects.map((project) => (
                        <tr key={project.id}>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {project.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {project.status}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {project.budget ? `$${project.budget.toFixed(2)}` : 'N/A'}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  No projects assigned to this invoice yet.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Please select a customer to view available projects.
            </p>
          )}
        </div>
        
        {/* Notes */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isEditMode ? 'Save Changes' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm; 
