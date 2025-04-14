import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconEdit, IconTrash } from '../components/icons';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import DataTable from '../components/DataTable';

interface Material {
  id: number;
  name: string;
  category: string;
  unit: string;
  costPerUnit: number;
  stock: number;
  minStock: number;
  location?: string;
  brand?: string;
  supplier?: string;
}

export default function Materials() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [materialToDelete, setMaterialToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: materials, isLoading, error } = useQuery({
    queryKey: ['materials', searchQuery, selectedCategory],
    queryFn: async () => {
      const materials = await api.getMaterials();
      
      // Apply search filter
      let filteredMaterials = searchQuery 
        ? materials.filter(material => 
            material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            material.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            material.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            material.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : materials;
      
      // Apply category filter
      if (selectedCategory !== 'All') {
        filteredMaterials = filteredMaterials.filter(material => 
          material.category === selectedCategory
        );
      }
      
      return filteredMaterials;
    },
  });

  const handleDelete = async () => {
    if (!materialToDelete) return;
    
    try {
      await api.deleteMaterial(materialToDelete.id);
      await queryClient.invalidateQueries({ queryKey: ['materials'] });
      setMaterialToDelete(null);
      setDeleteError(null);
      toast.success('Material deleted successfully');
    } catch (error) {
      console.error('Failed to delete material:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete material');
      toast.error('Failed to delete material');
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
    }
  };

  // Extract unique categories for the dropdown
  const categoryOptions = materials 
    ? ['All', ...new Set(materials.map(material => material.category))] 
    : ['All'];

  if (isLoading) {
    return <div>Loading materials...</div>;
  }

  if (error) {
    return <div>Error loading materials: {error.message}</div>;
  }

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Material },
    { header: 'Category', accessor: 'category' as keyof Material },
    { header: 'Unit', accessor: 'unit' as keyof Material },
    { 
      header: 'Cost', 
      accessor: (material: Material) => `€${material.costPerUnit.toFixed(2)}`
    },
    { 
      header: 'Stock', 
      accessor: (material: Material) => (
        <span>
          {material.stock} {material.stock < material.minStock && (
            <span className="text-red-500">(Low)</span>
          )}
        </span>
      )
    },
    { 
      header: 'Location', 
      accessor: (material: Material) => material.location || '-' 
    },
  ];

  return (
    <div className="h-full">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Materials</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all materials including their details and stock information.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/materials/new')}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <IconPlus className="h-5 w-5 inline-block mr-2" />
            Add Material
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Search (press Enter to search)
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="search"
            id="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearch}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
            placeholder="Search materials... (press Enter to search)"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mt-6">
        <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <div className="mt-1">
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials List */}
      <div className="mt-8 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <DataTable 
          columns={columns}
          data={materials || []}
          keyField="id"
          actions={(material) => (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => navigate(`/materials/${material.id}`)}
                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <IconEdit className="h-5 w-5" />
                <span className="sr-only">Edit {material.name}</span>
              </button>
              <button
                onClick={() => setMaterialToDelete({ id: material.id, name: material.name })}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                <IconTrash className="h-5 w-5" />
                <span className="sr-only">Delete {material.name}</span>
              </button>
            </div>
          )}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      {materialToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Material</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete the material "{materialToDelete.name}"?
            </p>
            {deleteError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{deleteError}</p>
            )}
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setMaterialToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 