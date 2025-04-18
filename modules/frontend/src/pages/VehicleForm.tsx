import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import Dropdown from '../components/Dropdown';

export default function VehicleForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
    color: '',
    type: '',
    status: 'active',
    purchaseDate: '',
    purchasePrice: 0,
    mileage: 0,
    fuelType: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchVehicle = async () => {
        try {
          const vehicle = await api.getVehicle(Number(id));

          // Ensure we have a valid vehicle object
          if (!vehicle) {
            throw new Error('Vehicle data is empty or invalid');
          }

          setFormData({
            name: vehicle.name || '',
            make: vehicle.make || '',
            model: vehicle.model || '',
            year: vehicle.year || new Date().getFullYear(),
            licensePlate: vehicle.licensePlate || '',
            vin: vehicle.vin || '',
            color: vehicle.color || '',
            type: vehicle.type || '',
            status: vehicle.status || 'active',
            purchaseDate: vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toISOString().split('T')[0] : '',
            purchasePrice: vehicle.purchasePrice || 0,
            mileage: vehicle.mileage || 0,
            fuelType: vehicle.fuelType || '',
            notes: vehicle.notes || '',
          });
        } catch (err) {
          console.error('Failed to load vehicle data:', err);
          setErrors({ general: err instanceof Error ? err.message : 'Failed to load vehicle data' });
          setShowErrors(true);
        }
      };

      fetchVehicle();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
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

    if (!data.make.trim()) {
      newErrors.make = 'Make is required';
    }

    if (!data.model.trim()) {
      newErrors.model = 'Model is required';
    }

    if (!data.year || data.year < 1900 || data.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Valid year is required (1900 - present)';
    }

    if (!data.type) {
      newErrors.type = 'Vehicle type is required';
    }

    if (!data.status) {
      newErrors.status = 'Status is required';
    }

    if (data.purchasePrice < 0) {
      newErrors.purchasePrice = 'Purchase price cannot be negative';
    }

    if (data.mileage < 0) {
      newErrors.mileage = 'Mileage cannot be negative';
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
      // Create a copy of the form data with parsed dates
      const apiData = {
        ...formData,
        // Convert string date to Date object if present
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : undefined,
      };

      if (id) {
        await api.updateVehicle(Number(id), apiData);
        toast.success('Vehicle updated successfully');
      } else {
        await api.createVehicle(apiData);
        toast.success('Vehicle created successfully');
      }
      navigate('/vehicles');
    } catch (err) {
      setErrors({ general: id ? 'Failed to update vehicle. Please try again.' : 'Failed to create vehicle. Please try again.' });
      setShowErrors(true);
      toast.error(id ? 'Failed to update vehicle' : 'Failed to create vehicle');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {id ? 'Edit Vehicle' : 'Create New Vehicle'}
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
              <div className="sm:col-span-3">
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

              <div className="sm:col-span-3">
                <label htmlFor="make" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Make
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="make"
                    id="make"
                    value={formData.make}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.make ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.make && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.make}</p>
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
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Year
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="year"
                    id="year"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.year ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.year && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.year}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <Dropdown
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={[
                    { value: 'car', label: 'Car' },
                    { value: 'truck', label: 'Truck' },
                    { value: 'van', label: 'Van' },
                    { value: 'suv', label: 'SUV' },
                    { value: 'motorcycle', label: 'Motorcycle' },
                    { value: 'other', label: 'Other' }
                  ]}
                  placeholder="Select a type"
                  label="Type"
                  error={errors.type}
                  showError={showErrors}
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <Dropdown
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'maintenance', label: 'Maintenance' },
                    { value: 'retired', label: 'Retired' }
                  ]}
                  placeholder="Select status"
                  label="Status"
                  error={errors.status}
                  showError={showErrors}
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  License Plate
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="licensePlate"
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.licensePlate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.licensePlate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.licensePlate}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="vin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  VIN
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="vin"
                    id="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.vin ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.vin && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.vin}</p>
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
                <Dropdown
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  options={[
                    { value: 'gasoline', label: 'Gasoline' },
                    { value: 'diesel', label: 'Diesel' },
                    { value: 'electric', label: 'Electric' },
                    { value: 'hybrid', label: 'Hybrid' },
                    { value: 'other', label: 'Other' }
                  ]}
                  placeholder="Select a fuel type"
                  label="Fuel Type"
                  error={errors.fuelType}
                  showError={showErrors}
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mileage
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="mileage"
                    id="mileage"
                    min="0"
                    value={formData.mileage}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.mileage ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.mileage && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.mileage}</p>
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
                  Purchase Price
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

              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    name="notes"
                    id="notes"
                    rows={4}
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
                onClick={() => navigate('/vehicles')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 h-10"
              >
                {isSubmitting ? 'Saving...' : id ? 'Save Changes' : 'Save Vehicle'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
