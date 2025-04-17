import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

const UNITS = ['kg', 'l', 'm', 'pcs', 'box', 'roll', 'sheet', 'tube'];
const CATEGORIES = ['Paint', 'Wood', 'Metal', 'Tools', 'Electrical', 'Plumbing', 'Concrete', 'Carpet', 'Tile', 'Glass'];

export default function MaterialForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    costPerUnit: '',
    color: '',
    brand: '',
    supplier: '',
    category: '',
    stock: '',
    minStock: '',
    location: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchMaterial = async () => {
        try {
          const material = await api.getMaterial(Number(id));
          setFormData({
            name: material.name,
            description: material.description || '',
            unit: material.unit,
            costPerUnit: material.costPerUnit.toString(),
            color: material.color || '',
            brand: material.brand || '',
            supplier: material.supplier || '',
            category: material.category,
            stock: material.stock.toString(),
            minStock: material.minStock.toString(),
            location: material.location || '',
            notes: material.notes || '',
          });
        } catch (err) {
          setErrors({ general: 'Failed to load material data' });
          setShowErrors(true);
          console.error(err);
        }
      };

      fetchMaterial();
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
    
    if (!data.unit) {
      newErrors.unit = 'Unit is required';
    }
    
    if (!data.costPerUnit.trim()) {
      newErrors.costPerUnit = 'Cost per unit is required';
    } else if (isNaN(parseFloat(data.costPerUnit)) || parseFloat(data.costPerUnit) < 0) {
      newErrors.costPerUnit = 'Cost per unit must be a positive number';
    }
    
    if (!data.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!data.stock.trim()) {
      newErrors.stock = 'Current stock is required';
    } else if (isNaN(parseInt(data.stock)) || parseInt(data.stock) < 0) {
      newErrors.stock = 'Current stock must be a non-negative number';
    }
    
    if (!data.minStock.trim()) {
      newErrors.minStock = 'Minimum stock is required';
    } else if (isNaN(parseInt(data.minStock)) || parseInt(data.minStock) < 0) {
      newErrors.minStock = 'Minimum stock must be a non-negative number';
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
      const materialData = {
        name: formData.name,
        description: formData.description,
        unit: formData.unit,
        costPerUnit: Number(formData.costPerUnit),
        color: formData.color || undefined,
        brand: formData.brand || undefined,
        supplier: formData.supplier || undefined,
        category: formData.category,
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      };

      if (id) {
        await api.updateMaterial(Number(id), materialData);
        toast.success('Material updated successfully');
      } else {
        await api.createMaterial(materialData);
        toast.success('Material created successfully');
      }
      navigate('/materials');
    } catch (err) {
      setErrors({ general: 'Failed to save material. Please try again.' });
      setShowErrors(true);
      toast.error(id ? 'Failed to update material' : 'Failed to create material');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {id ? 'Edit Material' : 'Add New Material'}
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
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unit
                </label>
                <div className="mt-1 relative">
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <select
                    name="unit"
                    id="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full appearance-none sm:text-sm ${showErrors && errors.unit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  >
                    <option value="">Select a unit</option>
                    {UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  {showErrors && errors.unit && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.unit}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="costPerUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cost per Unit (€)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="costPerUnit"
                    id="costPerUnit"
                    min="0"
                    step="0.01"
                    value={formData.costPerUnit}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.costPerUnit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.costPerUnit && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.costPerUnit}</p>
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
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Color
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="color"
                    id="color"
                    value={formData.color}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.color ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.color && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.color}</p>
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
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supplier
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="supplier"
                    id="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.supplier ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.supplier && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.supplier}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Stock
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="stock"
                    id="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.stock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.stock && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.stock}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Minimum Stock
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="minStock"
                    id="minStock"
                    min="0"
                    value={formData.minStock}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.minStock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.minStock && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.minStock}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
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
                onClick={() => navigate('/materials')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 h-10"
              >
                {isSubmitting ? 'Saving...' : id ? 'Save Changes' : 'Save Material'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 