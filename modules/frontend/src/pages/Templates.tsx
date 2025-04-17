import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api, Template } from '../services/api';
import DataTable from '../components/DataTable';
import { IconEdit, IconTrash, IconPlus } from '../components/icons';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import { settingsService } from '../services/settingsService';

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: number, title: string } | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtered data state
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [filteredTotalCount, setFilteredTotalCount] = useState(0);
  const [filteredTotalPages, setFilteredTotalPages] = useState(1);
  
  const navigate = useNavigate();

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

  // Fetch all templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        // Fetch all templates without pagination
        const response = await api.getTemplates({ page: 1, limit: 1000 });
        setTemplates(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setError(error instanceof Error ? error : new Error('Failed to load templates'));
        toast.error('Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Apply filters and pagination whenever data, search query, or type filter changes
  useEffect(() => {
    if (!templates.length) return;
    
    let result = [...templates];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(template => 
        template.title.toLowerCase().includes(query) ||
        template.type.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(template => 
        template.type === filterType
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
    setFilteredTemplates(paginatedResult);
  }, [templates, searchQuery, filterType, rowsPerPage, currentPage]);

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      await api.deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
      toast.success(`Template "${templateToDelete.title}" deleted successfully`);
      
      // Update templates state by removing the deleted template
      setTemplates(prevTemplates => 
        prevTemplates.filter(template => template.id !== templateToDelete.id)
      );
    } catch (error) {
      toast.error('Failed to delete template');
      console.error('Error deleting template:', error);
    }
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
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

  const columns = [
    {
      header: 'Title',
      accessor: 'title' as keyof Template,
    },
    {
      header: 'Type',
      accessor: (row: Template) => <span className="capitalize">{row.type}</span>,
    },
    {
      header: 'Default',
      accessor: (row: Template) => (
        <span className={row.isDefault ? 'text-green-600' : 'text-gray-400'}>
          {row.isDefault ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      header: 'Created At',
      accessor: (row: Template) => new Date(row.createdAt!).toLocaleDateString(),
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div>Error loading templates: {error.message}</div>;
  }

  return (
    <div className="h-full">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Templates</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all templates including their contact information.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/templates/new')}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <IconPlus className="h-5 w-5 inline-block mr-2" />
            Add Template
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
            placeholder="Search templates... (press Enter to search)"
          />
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by Type
        </label>
        <div className="mt-1 relative">
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <select
            id="type-filter"
            value={filterType}
            onChange={handleTypeFilterChange}
            className="block w-full appearance-none rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-3 pr-10 py-2 h-10"
          >
            <option value="all">All Types</option>
            <option value="invoice">Invoice</option>
            <option value="proposal">Proposal</option>
            <option value="contract">Contract</option>
            <option value="estimate">Estimate</option>
            <option value="receipt">Receipt</option>
            <option value="project_report">Project Report</option>
            <option value="maintenance_plan">Maintenance Plan</option>
            <option value="warranty">Warranty</option>
            <option value="thank_you">Thank You</option>
            <option value="quote">Quote</option>
          </select>
        </div>
      </div>

      <div className="mt-8 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <DataTable 
          columns={columns}
          data={filteredTemplates}
          keyField="id"
          actions={(template) => (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => navigate(`/templates/${template.id}/edit`)}
                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                title="Edit template"
              >
                <IconEdit className="h-5 w-5" />
                <span className="sr-only">Edit template</span>
              </button>
              <button
                onClick={() => setTemplateToDelete({ id: template.id, title: template.title })}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                title="Delete template"
              >
                <IconTrash className="h-5 w-5" />
                <span className="sr-only">Delete template</span>
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
        isOpen={templateToDelete !== null}
        title="Delete Template"
        message={templateToDelete ? `Are you sure you want to delete the template "${templateToDelete.title}"? This action cannot be undone.` : ''}
        errorMessage={null}
        onCancel={() => setTemplateToDelete(null)}
        onConfirm={handleDeleteTemplate}
      />
    </div>
  );
};

export default Templates; 