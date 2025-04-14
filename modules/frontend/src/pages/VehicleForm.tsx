import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

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
  const [error, setError] = useState<string | null>(null);

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
          setError(err instanceof Error ? err.message : 'Failed to load vehicle data');
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

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
      setError(id ? 'Failed to update vehicle. Please try again.' : 'Failed to create vehicle. Please try again.');
      toast.error(id ? 'Failed to update vehicle' : 'Failed to create vehicle');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {id ? 'Edit Vehicle' : 'Add New Vehicle'}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            />
          </div>

          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Make
            </label>
            <input
              type="text"
              name="make"
              id="make"
              required
              value={formData.make}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Model
            </label>
            <input
              type="text"
              name="model"
              id="model"
              required
              value={formData.model}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Year
            </label>
            <input
              type="number"
              name="year"
              id="year"
              required
              min="1900"
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type
            </label>
            <select
              name="type"
              id="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            >
              <option value="">Select a type</option>
              <option value="car">Car</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="suv">SUV</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="other">Other</option>
            </select>
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
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>

          <div>
            <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              License Plate
            </label>
            <input
              type="text"
              name="licensePlate"
              id="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            />
          </div>

          <div>
            <label htmlFor="vin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              VIN
            </label>
            <input
              type="text"
              name="vin"
              id="vin"
              value={formData.vin}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            />
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Color
            </label>
            <input
              type="text"
              name="color"
              id="color"
              value={formData.color}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            />
          </div>

          <div>
            <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fuel Type
            </label>
            <select
              name="fuelType"
              id="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            >
              <option value="">Select a fuel type</option>
              <option value="gasoline">Gasoline</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mileage
            </label>
            <input
              type="number"
              name="mileage"
              id="mileage"
              min="0"
              value={formData.mileage}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            />
          </div>

          <div>
            <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              id="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            />
          </div>

          <div>
            <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Purchase Price
            </label>
            <input
              type="number"
              name="purchasePrice"
              id="purchasePrice"
              min="0"
              step="0.01"
              value={formData.purchasePrice}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes
          </label>
          <textarea
            name="notes"
            id="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
          />
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
      </form>
    </div>
  );
} 