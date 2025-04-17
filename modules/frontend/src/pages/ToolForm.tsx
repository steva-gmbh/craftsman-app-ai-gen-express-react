import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

const CATEGORIES = ['Power Tools', 'Hand Tools', 'Measuring Tools', 'Safety Equipment', 'Cleaning Tools', 'Garden Tools', 'Construction Tools', 'Painting Tools', 'Plumbing Tools', 'Electrical Tools'];

export default function ToolForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    purchaseDate: '',
    purchasePrice: '',
    location: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchTool = async () => {
        try {
          const tool = await api.getTool(Number(id));
          setFormData({
            name: tool.name,
            description: tool.description || '',
            category: tool.category,
            brand: tool.brand || '',
            model: tool.model || '',
            purchaseDate: tool.purchaseDate ? new Date(tool.purchaseDate).toISOString().split('T')[0] : '',
            purchasePrice: tool.purchasePrice?.toString() || '',
            location: tool.location || '',
            notes: tool.notes || '',
          });
        } catch (err) {
          setErrors({ general: 'Failed to load tool data' });
          setShowErrors(true);
          console.error(err);
        }
      };

      fetchTool();
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
    
    if (!data.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!data.category) {
      newErrors.category = 'Category is required';
    }
    
    if (data.purchasePrice && (isNaN(parseFloat(data.purchasePrice)) || parseFloat(data.purchasePrice) < 0)) {
      newErrors.purchasePrice = 'Purchase price must be a positive number';
    }
    
    if (data.purchaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.purchaseDate)) {
      newErrors.purchaseDate = 'Invalid date format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const toolData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : undefined,
        purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      };

      if (id) {
        await api.updateTool(Number(id), toolData);
        toast.success('Tool updated successfully');
      } else {
        await api.createTool(toolData);
        toast.success('Tool created successfully');
      }
      navigate('/tools');
    } catch (err) {
      setErrors({ general: 'Failed to save tool. Please try again.' });
      setShowErrors(true);
      toast.error(id ? 'Failed to update tool' : 'Failed to create tool');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {id ? 'Edit Tool' : 'Add New Tool'}
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
                  Name
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
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <div className="mt-1 relative">
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full appearance-none sm:text-sm ${showErrors && errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {showErrors && errors.category && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.category}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Brand
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="brand"
                    id="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.brand ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.brand && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.brand}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Model
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="model"
                    id="model"
                    value={formData.model}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.model ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.model && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.model}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Purchase Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="purchaseDate"
                    id="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.purchaseDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.purchaseDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.purchaseDate}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Purchase Price (€)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="purchasePrice"
                    id="purchasePrice"
                    min="0"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.purchasePrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.purchasePrice && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.purchasePrice}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Storage Location
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.location && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.location}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    name="notes"
                    id="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.notes ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2`}
                  />
                  {showErrors && errors.notes && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.notes}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/tools')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 h-10"
              >
                {isSubmitting ? 'Saving...' : id ? 'Save Tool' : 'Save Tool'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 