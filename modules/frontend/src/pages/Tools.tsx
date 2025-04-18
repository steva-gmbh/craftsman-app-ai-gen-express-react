import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconEdit, IconTrash } from '../components/icons';
import { api } from '../services/api';
import { settingsService } from '../services/settingsService';
import { toast } from 'react-hot-toast';
import DataTable from '../components/DataTable';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import Dropdown from '../components/Dropdown';

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

  // Filtered data state
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [filteredTotalCount, setFilteredTotalCount] = useState(0);
  const [filteredTotalPages, setFilteredTotalPages] = useState(1);

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
    queryKey: ['tools'],
    queryFn: async () => {
      // Fetch all tools without pagination to handle client-side filtering/pagination properly
      const toolsResponse = await api.getTools({
        page: 1,
        limit: 1000 // Use a high limit to get all tools
      });
      return toolsResponse;
    },
  });

  // Apply filters and pagination whenever data, search query, or category changes
  useEffect(() => {
    if (!data?.data) return;
    
    let result = [...data.data];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.model?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(tool => 
        tool.category === selectedCategory
      );
    }
    
    // Update filtered data and pagination info
    const filteredCount = result.length;
    const filteredPages = Math.max(1, Math.ceil(filteredCount / rowsPerPage));
    
    setFilteredTotalCount(filteredCount);
    setFilteredTotalPages(filteredPages);
    
    // Make sure we don't exceed the total number of pages
    const validCurrentPage = Math.min(currentPage, filteredPages);
    
    // Apply pagination to the filtered results
    const startIndex = (validCurrentPage - 1) * rowsPerPage;
    const paginatedResult = result.slice(startIndex, startIndex + rowsPerPage);
    setFilteredTools(paginatedResult);
  }, [data?.data, searchQuery, selectedCategory, rowsPerPage, currentPage]);

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
    // Only update the page if it's different from the current page
    // and within the valid range
    if (page !== currentPage && page >= 1 && page <= filteredTotalPages) {
      setCurrentPage(page);
    }
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
        <Dropdown
          id="category-filter"
          name="category-filter"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1); // Reset to first page on filter change
          }}
          options={categoryOptions.map(category => ({
            value: category,
            label: category
          }))}
          label="Category"
        />
      </div>

      {/* Tools List */}
      <div className="mt-8 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <DataTable 
          columns={columns}
          data={filteredTools}
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
          totalCount={filteredTotalCount}
          currentPage={currentPage}
          totalPages={filteredTotalPages}
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