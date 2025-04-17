import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api, Template } from '../services/api';
import DataTable from '../components/DataTable';
import { IconEdit, IconTrash, IconPlus } from '../components/icons';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

const Templates: React.FC = () => {
  const [data, setData] = useState<{ data: Template[], totalCount: number, totalPages: number, currentPage: number }>({
    data: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: number, title: string } | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchTemplates = async (page: number = 1, type?: string, query?: string) => {
    setIsLoading(true);
    try {
      const params: { page: number; limit: number; type?: string; search?: string } = { page, limit: 10 };
      if (type && type !== 'all') {
        params.type = type;
      }
      if (query) {
        params.search = query;
      }
      const response = await api.getTemplates(params);
      setData(response);
      setCurrentPage(response.currentPage);
    } catch (error) {
      toast.error('Failed to load templates');
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(currentPage, filterType === 'all' ? undefined : filterType, searchQuery);
  }, [currentPage, filterType, searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      await api.deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
      toast.success(`Template "${templateToDelete.title}" deleted successfully`);
      fetchTemplates(currentPage, filterType === 'all' ? undefined : filterType, searchQuery);
    } catch (error) {
      toast.error('Failed to delete template');
      console.error('Error deleting template:', error);
    }
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
      setCurrentPage(1); // Reset to first page on new search
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
        <div className="mt-1">
          <select
            id="type-filter"
            value={filterType}
            onChange={handleTypeFilterChange}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 h-10"
          >
            <option value="all">All Types</option>
            <option value="invoice">Invoice</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="mt-8 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <DataTable 
            columns={columns}
            data={data?.data || []}
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
            totalCount={data?.totalCount || 0}
            currentPage={currentPage}
            totalPages={data?.totalPages || 1}
            onPageChange={handlePageChange}
            isPaginated={true}
            rowsPerPage={10}
          />
        </div>
      )}

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