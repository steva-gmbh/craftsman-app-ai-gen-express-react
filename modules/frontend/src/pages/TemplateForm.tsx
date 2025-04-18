import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api, Template } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';

const TemplateForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const editorRef = useRef<{ getContent: () => string } | null>(null);
  
  const [formData, setFormData] = useState<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>({
    type: 'invoice',
    title: '',
    description: '',
    body: '',
    isDefault: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchTemplate = async () => {
        setIsLoading(true);
        try {
          const template = await api.getTemplate(Number(id));
          setFormData({
            type: template.type,
            title: template.title,
            description: template.description || '',
            body: template.body,
            isDefault: template.isDefault
          });
        } catch (error) {
          toast.error('Failed to load template');
          console.error('Error fetching template:', error);
          navigate('/templates');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchTemplate();
    }
  }, [id, isEditMode, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  const handleEditorChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      body: value
    }));
    
    // Clear error for body field when user changes it
    if (errors.body) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.body;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the LATEST content directly from the editor component
    const latestContent = editorRef.current?.getContent() || formData.body;
    
    // Update form data with the latest content
    const updatedFormData = {
      ...formData,
      body: latestContent
    };
    
    setShowErrors(true);
    
    // Validate with the updated data
    const isValid = validateFormData(updatedFormData);
    
    if (!isValid) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (isEditMode && id) {
        await api.updateTemplate(Number(id), updatedFormData);
        toast.success('Template updated successfully');
      } else {
        await api.createTemplate(updatedFormData);
        toast.success('Template created successfully');
      }
      navigate('/templates');
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update template' : 'Failed to create template');
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const validateFormData = (data: typeof formData) => {
    const newErrors: Record<string, string> = {};
    
    if (!data.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    // Better HTML content validation - check if it contains actual content
    // beyond just empty paragraphs or whitespace
    const strippedContent = data.body
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
      .replace(/<br>/g, '') // Remove <br> tags
      .trim();
      
    if (!strippedContent) {
      newErrors.body = 'Content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {isEditMode ? 'Edit Template' : 'Create Template'}
      </h1>

      {Object.keys(errors).length > 0 && showErrors && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
          Please fix the errors below to continue.
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Template Type
                </label>
                <div className="mt-1">
                  <div className="relative">
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full appearance-none sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10"
                    >
                      <option value="invoice">Invoice</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${showErrors && errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 h-10`}
                    placeholder="Template Title"
                  />
                  {showErrors && errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.title}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2"
                    placeholder="Template Description"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Set as Default Template
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  If checked, this template will be used as the default for its type.
                </p>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Content
                </label>
                <div className={`bg-white dark:bg-gray-700 border ${showErrors && errors.body ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md`}>
                  <RichTextEditor
                    ref={editorRef}
                    value={formData.body}
                    onChange={handleEditorChange}
                    placeholder="Enter template content here..."
                    height="400px"
                  />
                </div>
                {showErrors && errors.body ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.body}</p>
                ) : (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>
                      Use the 'Variables' dropdown in the toolbar to insert placeholders like {'{'}{'{'}'invoice.invoiceNumber'{'}'}{'}}'} for dynamic content.
                    </p>
                    <p className="mt-1">
                      <strong>Loop Functionality:</strong> You can iterate over projects and jobs using the loop syntax:
                    </p>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-x-auto">
{`{{#each projects}}
  Project: {{project.name}}
  
  {{#each jobs}}
    • {{job.title}}: {{job.price}}
  {{/each}}
{{/each}}`}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/templates')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 h-10"
              >
                {isSaving ? 'Saving...' : (isEditMode ? 'Save Template' : 'Create Template')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateForm; 