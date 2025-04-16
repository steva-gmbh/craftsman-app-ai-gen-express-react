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
    console.log("Editor changed to:", value);
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
    
    // Log current form state before validation
    console.log('Form submission state:', {
      title: updatedFormData.title,
      body: updatedFormData.body,
      bodyLength: updatedFormData.body.length,
      hasContent: updatedFormData.body && updatedFormData.body.trim().length > 0
    });
    
    setShowErrors(true);
    
    // Validate with the updated data
    const isValid = validateFormData(updatedFormData);
    
    if (!isValid) {
      console.log('Form validation failed:', errors);
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
      
    console.log('Validating content:', {
      original: data.body,
      stripped: strippedContent,
      isEmpty: !strippedContent
    });
    
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Template' : 'Create Template'}</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label htmlFor="type" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Template Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="invoice">Invoice</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`shadow appearance-none border ${showErrors && errors.title ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            placeholder="Template Title"
          />
          {showErrors && errors.title && (
            <p className="text-red-500 text-xs italic mt-1">{errors.title}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Template Description"
            rows={3}
          />
        </div>
        
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 block text-gray-700 dark:text-gray-300 text-sm font-bold">
              Set as Default Template
            </label>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If checked, this template will be used as the default for its type.
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Template Content
          </label>
          <div className={`bg-white dark:bg-gray-700 border ${showErrors && errors.body ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded`}>
            <RichTextEditor
              ref={editorRef}
              value={formData.body}
              onChange={handleEditorChange}
              placeholder="Enter template content here..."
              height="500px"
            />
          </div>
          {showErrors && errors.body ? (
            <p className="text-red-500 text-xs italic mt-1">{errors.body}</p>
          ) : (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <p>
                Use the 'Variables' dropdown in the toolbar to insert placeholders like {'{'}{'{'}'invoice.invoiceNumber'{'}'}{'}}'} for dynamic content.
              </p>
              <p className="mt-1">
                <strong>Loop Functionality:</strong> You can now iterate over projects and jobs using the loop syntax:
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
        
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/templates')}
            className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Template')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateForm; 