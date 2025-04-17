import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconEdit, IconTrash } from '../components/icons';
import { api } from '../services/api';
import { settingsService } from '../services/settingsService';
import { toast } from 'react-hot-toast';
import DataTable from '../components/DataTable';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

interface Tool {
  id: number;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  purchaseDate?: Date | string;
  location?: string;
}

export default function Tools() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toolToDelete, setToolToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load rows per page from user settings
  useEffect(() => {
    const loadRowsPerPage = async () => {
      try {
        const perPage = await settingsService.getRowsPerPage();
        setRowsPerPage(perPage);
      } catch (error) {
        console.error('Error loading rows per page setting:', error);
      }
    };
    
    loadRowsPerPage();
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tools', searchQuery, selectedCategory, currentPage, rowsPerPage],
    queryFn: async () => {
      const toolsResponse = await api.getTools({
        page: currentPage,
        limit: rowsPerPage
      });
      
      let filteredTools = toolsResponse.data;
      
      // Apply search filter
      if (searchQuery) {
        filteredTools = filteredTools.filter(tool => 
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.model?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply category filter
      if (selectedCategory !== 'All') {
        filteredTools = filteredTools.filter(tool => 
          tool.category === selectedCategory
        );
      }
      
      return {
        ...toolsResponse,
        data: filteredTools
      };
    },
  });

  const handleDelete = async () => {
    if (!toolToDelete) return;
    
    try {
      await api.deleteTool(toolToDelete.id);
      await queryClient.invalidateQueries({ queryKey: ['tools'] });
      setToolToDelete(null);
      setDeleteError(null);
      toast.success('Tool deleted successfully');
    } catch (error) {
      console.error('Failed to delete tool:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete tool');
      toast.error('Failed to delete tool');
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
      setCurrentPage(1); // Reset to first page on new search
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Extract unique categories for the dropdown
  const categoryOptions = data?.data 
    ? ['All', ...new Set(data.data.map(tool => tool.category))] 
    : ['All'];

  if (isLoading) {
    return <div>Loading tools...</div>;
  }

  if (error) {
    return <div>Error loading tools: {error.message}</div>;
  }

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Tool },
    { header: 'Category', accessor: 'category' as keyof Tool },
    { 
      header: 'Brand', 
      accessor: (tool: Tool) => tool.brand || '-'
    },
    { 
      header: 'Model', 
      accessor: (tool: Tool) => tool.model || '-'
    },
    { 
      header: 'Purchase Date', 
      accessor: (tool: Tool) => {
        if (!tool.purchaseDate) return '-';
        const date = tool.purchaseDate instanceof Date ? 
          tool.purchaseDate : 
          new Date(tool.purchaseDate);
        return date.toLocaleDateString();
      }
    },
    { 
      header: 'Location', 
      accessor: (tool: Tool) => tool.location || '-'
    },
  ];

  return (
    <div className="h-full">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tools</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all tools including their details and specifications.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/tools/new')}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <IconPlus className="h-5 w-5 inline-block mr-2" />
            Add Tool
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
            placeholder="Search tools... (press Enter to search)"
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
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
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

      {/* Tools List */}
      <div className="mt-8 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <DataTable 
          columns={columns}
          data={data?.data || []}
          keyField="id"
          actions={(tool) => (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => navigate(`/tools/${tool.id}`)}
                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <IconEdit className="h-5 w-5" />
                <span className="sr-only">Edit {tool.name}</span>
              </button>
              <button
                onClick={() => setToolToDelete({ id: tool.id, name: tool.name })}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                <IconTrash className="h-5 w-5" />
                <span className="sr-only">Delete {tool.name}</span>
              </button>
            </div>
          )}
          totalCount={data?.totalCount || 0}
          currentPage={currentPage}
          totalPages={data?.totalPages || 1}
          onPageChange={handlePageChange}
          isPaginated={true}
          rowsPerPage={rowsPerPage}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={toolToDelete !== null}
        title="Delete Tool"
        message={toolToDelete ? `Are you sure you want to delete the tool "${toolToDelete.name}"?` : ''}
        errorMessage={deleteError}
        onCancel={() => {
          setToolToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
} 