import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Invoice, Customer, Project } from '../services/api';
import { toast } from 'react-hot-toast';

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
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
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
            setAvailableProjects((projectsResponse.data || []).filter(
              project => project.customerId === invoice.customerId
            ));
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
          setAvailableProjects((projectsResponse.data || []).filter(
            project => project.customerId === formData.customerId
          ));
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      } else {
        setAvailableProjects([]);
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
            availableProjects.length > 0 ? (
              <div className="mt-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 max-h-60 overflow-y-auto p-2">
                {availableProjects.map(project => (
                  <div key={project.id} className="flex items-start p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                    <input
                      type="checkbox"
                      id={`project-${project.id}`}
                      checked={formData.projectIds?.includes(project.id) || false}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFormData(prev => {
                          const currentProjects = prev.projectIds || [];
                          return {
                            ...prev,
                            projectIds: isChecked
                              ? [...currentProjects, project.id]
                              : currentProjects.filter(id => id !== project.id)
                          };
                        });
                      }}
                      className="h-4 w-4 mt-1 text-indigo-600 border-gray-300 rounded"
                    />
                    <label htmlFor={`project-${project.id}`} className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                      <div className="font-medium">{project.name}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">{project.description}</div>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                No projects found for this customer. <a href="/projects/new" className="text-indigo-600 dark:text-indigo-400 hover:underline">Create a new project</a>.
              </p>
            )
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
            {isEditMode ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm; 