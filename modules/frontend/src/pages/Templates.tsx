import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api, Template } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import { IconEdit, IconTrash, IconPlus } from '../components/icons';

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
  const navigate = useNavigate();

  const fetchTemplates = async (page: number = 1, type?: string) => {
    setIsLoading(true);
    try {
      const params: { page: number; limit: number; type?: string } = { page, limit: 10 };
      if (type && type !== 'all') {
        params.type = type;
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
    fetchTemplates(currentPage, filterType === 'all' ? undefined : filterType);
  }, [currentPage, filterType]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      await api.deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
      toast.success(`Template "${templateToDelete.title}" deleted successfully`);
      fetchTemplates(currentPage, filterType === 'all' ? undefined : filterType);
    } catch (error) {
      toast.error('Failed to delete template');
      console.error('Error deleting template:', error);
    }
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Templates</h1>
        <button
          onClick={() => navigate('/templates/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
        >
          <IconPlus className="w-5 h-5 mr-1" />
          Add Template
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Filter by Type
        </label>
        <select
          id="type-filter"
          value={filterType}
          onChange={handleTypeFilterChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="invoice">Invoice</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mt-4 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
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
              rowsPerPage={10}
            />
          </div>

          <div className="mt-4">
            <Pagination 
              currentPage={currentPage}
              totalPages={data?.totalPages || 1}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {templateToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirm deletion</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Are you sure you want to delete the template "{templateToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setTemplateToDelete(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTemplate}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates; 