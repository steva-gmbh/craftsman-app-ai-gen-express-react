import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import Dropdown from '../components/Dropdown';

export default function UserForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNewUser = !id;

  // Get current user to check if they have admin role
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser?.role === 'admin';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);

  // Fetch user data if editing
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      if (isNewUser) return null;
      return await api.getUser(parseInt(id as string));
    },
    enabled: !!id && isAdmin,
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name,
        email: userData.email,
        password: '', // Don't show password
        role: userData.role,
      });
    }
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (isNewUser && !data.password.trim()) {
      newErrors.password = 'Password is required for new users';
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
      if (isNewUser) {
        await api.createUser(formData);
        toast.success('User created successfully');
      } else {
        // For existing users, password is optional
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          ...(formData.password ? { password: formData.password } : {}),
        };

        await api.updateUser(parseInt(id as string), updateData);
        toast.success('User updated successfully');
      }

      // Refresh user data
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'An error occurred' });
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">You do not have permission to view this page.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  if (error && !isNewUser) {
    return <div>Error loading user: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {isNewUser ? 'Add New User' : 'Edit User'}
      </h1>

      {Object.keys(errors).length > 0 && showErrors && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
          {errors.general || "Please fix the errors below to continue."}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit} noValidate>
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password {isNewUser ? '' : '(leave blank to keep current)'}
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required={isNewUser}
                    value={formData.password}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                  />
                  {showErrors && errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.password}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <Dropdown
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  options={[
                    { value: 'user', label: 'User' },
                    { value: 'admin', label: 'Admin' }
                  ]}
                  label="Role"
                  error={errors.role}
                  showError={showErrors}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/users')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 h-10"
              >
                {isSubmitting ? 'Saving...' : isNewUser ? 'Create User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
