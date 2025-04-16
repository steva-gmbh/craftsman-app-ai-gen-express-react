// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

// Add custom CSS for larger font size and dark mode compatibility
const editorStyles = `
  .ql-editor {
    font-size: 16px;
  }
  .ql-editor p {
    font-size: 16px;
  }
  .ql-editor h1 {
    font-size: 28px;
  }
  .ql-editor h2 {
    font-size: 24px;
  }
  .ql-editor h3 {
    font-size: 20px;
  }
  .ql-variables-dropdown {
    font-size: 14px;
  }
  .ql-variables-dropdown div {
    font-size: 14px;
  }
  .ql-toolbar button {
    font-size: 14px;
  }
  .ql-variables {
    font-size: 14px !important;
  }
  
  /* Dark mode styles */
  .dark .ql-snow.ql-toolbar button,
  .dark .ql-snow .ql-toolbar button {
    color: #e2e8f0;
  }
  
  .dark .ql-snow.ql-toolbar button:hover,
  .dark .ql-snow .ql-toolbar button:hover,
  .dark .ql-snow.ql-toolbar button.ql-active, 
  .dark .ql-snow .ql-toolbar button.ql-active {
    color: #818cf8; 
  }
  
  .dark .ql-snow.ql-toolbar button:hover .ql-fill,
  .dark .ql-snow .ql-toolbar button:hover .ql-fill,
  .dark .ql-snow.ql-toolbar button.ql-active .ql-fill,
  .dark .ql-snow .ql-toolbar button.ql-active .ql-fill {
    fill: #818cf8;
  }
  
  .dark .ql-snow.ql-toolbar button:hover .ql-stroke,
  .dark .ql-snow .ql-toolbar button:hover .ql-stroke,
  .dark .ql-snow.ql-toolbar button.ql-active .ql-stroke,
  .dark .ql-snow .ql-toolbar button.ql-active .ql-stroke,
  .dark .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
  .dark .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke {
    stroke: #818cf8;
  }
  
  .dark .ql-snow .ql-stroke {
    stroke: #e2e8f0;
  }
  
  .dark .ql-snow .ql-fill,
  .dark .ql-snow .ql-stroke.ql-fill {
    fill: #e2e8f0;
  }
  
  .dark .ql-snow .ql-picker {
    color: #e2e8f0;
  }
  
  .dark .ql-snow .ql-picker-options {
    background-color: #1f2937;
    border-color: #4b5563;
  }
  
  .dark .ql-snow .ql-picker.ql-expanded .ql-picker-label {
    border-color: #4b5563;
  }
  
  .dark .ql-snow .ql-picker-options .ql-picker-item {
    color: #e2e8f0;
  }
  
  .dark .ql-snow .ql-picker-options .ql-picker-item:hover {
    background-color: #374151;
    color: #818cf8;
  }
  
  /* Make the header dropdown match Variables dropdown styles in both light and dark modes */
  .ql-snow .ql-picker.ql-header .ql-picker-label {
    color: inherit;
  }
  
  .ql-snow .ql-picker.ql-header .ql-picker-label svg .ql-stroke {
    stroke: currentColor;
  }
  
  .ql-snow .ql-picker.ql-header .ql-picker-label:hover {
    color: #06c;
  }
  
  .ql-snow .ql-picker.ql-header .ql-picker-label:hover svg .ql-stroke {
    stroke: #06c;
  }
  
  /* Dark mode styles for header dropdown */
  .dark .ql-snow .ql-picker.ql-header .ql-picker-label {
    color: #f8fafc;
  }
  
  .dark .ql-snow .ql-picker.ql-header .ql-picker-label:hover {
    color: #818cf8;
  }
  
  .dark .ql-snow .ql-picker.ql-header .ql-picker-label svg .ql-stroke {
    stroke: #f8fafc;
  }
  
  .dark .ql-snow .ql-picker.ql-header .ql-picker-label:hover svg .ql-stroke {
    stroke: #818cf8;
  }
  
  .dark .ql-snow .ql-tooltip {
    background-color: #1f2937;
    border-color: #4b5563;
    color: #e2e8f0;
  }
  
  .dark .ql-snow .ql-tooltip input[type=text] {
    background-color: #374151;
    border-color: #4b5563;
    color: #e2e8f0;
  }
  
  .dark .ql-snow.ql-toolbar, 
  .dark .ql-snow .ql-toolbar {
    border-color: #4b5563;
    background-color: #1f2937;
  }
  
  .dark .ql-container.ql-snow {
    border-color: #4b5563;
  }
  
  .dark .ql-editor {
    color: #e2e8f0;
    background-color: #1f2937;
  }
  
  .dark .ql-variables-dropdown {
    background-color: #1f2937;
    border-color: #4b5563;
    color: #e2e8f0;
  }
  
  .dark .ql-variables-dropdown div {
    color: #e2e8f0;
  }
  
  .dark .ql-variables-dropdown div:hover {
    background-color: #374151;
  }
  
  .dark .ql-variables-dropdown div[style*="backgroundColor: #f0f0f0"] {
    background-color: #374151 !important;
    border-color: #4b5563 !important;
  }
`;

// Available variables that can be inserted
const VARIABLES = [
  {
    title: 'Invoice',
    items: [
      { label: 'Invoice Number', value: '{{invoice.invoiceNumber}}' },
      { label: 'Issue Date', value: '{{invoice.issueDate}}' },
      { label: 'Due Date', value: '{{invoice.dueDate}}' },
      { label: 'Status', value: '{{invoice.status}}' },
      { label: 'Total Amount', value: '{{invoice.totalAmount}}' },
      { label: 'Tax Rate', value: '{{invoice.taxRate}}' },
      { label: 'Tax Amount', value: '{{invoice.taxAmount}}' },
      { label: 'Notes', value: '{{invoice.notes}}' },
      { label: 'Subtotal', value: '{{invoice.subtotal}}' }
    ]
  },
  {
    title: 'Customer',
    items: [
      { label: 'Name', value: '{{customer.name}}' },
      { label: 'Email', value: '{{customer.email}}' },
      { label: 'Phone', value: '{{customer.phone}}' },
      { label: 'Address', value: '{{customer.address}}' }
    ]
  },
  {
    title: 'Projects Loop',
    items: [
      { label: 'Start Projects Loop', value: '{{#each projects}}\n' },
      { label: 'Project Name', value: '{{project.name}}' },
      { label: 'Project Description', value: '{{project.description}}' },
      { label: 'Project Status', value: '{{project.status}}' },
      { label: 'Project Budget', value: '{{project.budget}}' },
      { label: 'Project Start Date', value: '{{project.startDate}}' },
      { label: 'Project End Date', value: '{{project.endDate}}' },
      { label: 'End Projects Loop', value: '{{/each}}' }
    ]
  },
  {
    title: 'Jobs Loop (inside Projects)',
    items: [
      { label: 'Start Jobs Loop', value: '{{#each jobs}}\n' },
      { label: 'Job Title', value: '{{job.title}}' },
      { label: 'Job Description', value: '{{job.description}}' },
      { label: 'Job Status', value: '{{job.status}}' },
      { label: 'Job Price', value: '{{job.price}}' },
      { label: 'Job Start Date', value: '{{job.startDate}}' },
      { label: 'Job End Date', value: '{{job.endDate}}' },
      { label: 'End Jobs Loop', value: '{{/each}}' }
    ]
  }
];

// Create a custom module for Quill
class VariablesModule {
  constructor(quill, options) {
    this.quill = quill;
    this.options = options;
    this.container = document.createElement('div');
    this.variablesButton = null;
    this.variablesDropdown = null;
    
    // Initialize the module
    this.initialize();
  }
  
  initialize() {
    // Create variables button in toolbar
    this.variablesButton = document.createElement('button');
    this.variablesButton.innerHTML = 'Variables';
    this.variablesButton.className = 'ql-variables';
    this.variablesButton.type = 'button';
    this.variablesButton.style.width = 'auto';
    this.variablesButton.style.padding = '0 8px';
    
    // Create wrapper span for button
    const buttonWrapper = document.createElement('span');
    buttonWrapper.className = 'ql-formats';
    buttonWrapper.appendChild(this.variablesButton);
    
    // Find toolbar and append button
    const toolbar = this.quill.container.previousSibling;
    toolbar.appendChild(buttonWrapper);
    
    // Create variables dropdown
    this.variablesDropdown = this.createDropdown();
    document.body.appendChild(this.variablesDropdown);
    
    // Add click event to variables button
    this.variablesButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDropdown();
    });
    
    // Add document click event to close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (
        this.variablesDropdown &&
        e.target !== this.variablesButton &&
        !this.variablesDropdown.contains(e.target)
      ) {
        this.hideDropdown();
      }
    });
    
    // Watch for theme changes using MutationObserver
    this.setupThemeObserver();
  }
  
  // Setup observer to watch for dark mode changes
  setupThemeObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && 
            mutation.target === document.documentElement) {
          // Theme has changed, recreate the dropdown with updated styles
          if (this.variablesDropdown) {
            document.body.removeChild(this.variablesDropdown);
          }
          this.variablesDropdown = this.createDropdown();
          document.body.appendChild(this.variablesDropdown);
        }
      });
    });
    
    // Start observing changes to html element's class
    observer.observe(document.documentElement, { attributes: true });
  }
  
  createDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'ql-variables-dropdown';
    dropdown.style.display = 'none';
    dropdown.style.position = 'fixed';
    dropdown.style.width = '200px';
    dropdown.style.maxHeight = '300px';
    dropdown.style.overflow = 'auto';
    
    // Add dark mode detection
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // Set styles based on theme
    dropdown.style.backgroundColor = isDarkMode ? '#1f2937' : 'white';
    dropdown.style.border = isDarkMode ? '1px solid #4b5563' : '1px solid #ccc';
    dropdown.style.color = isDarkMode ? '#e2e8f0' : 'inherit';
    dropdown.style.borderRadius = '4px';
    dropdown.style.boxShadow = isDarkMode ? 
      '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)';
    dropdown.style.zIndex = '9999';
    
    // Add variables groups and items
    VARIABLES.forEach(group => {
      // Create group header
      const groupHeader = document.createElement('div');
      groupHeader.innerHTML = group.title;
      groupHeader.style.padding = '8px 12px';
      groupHeader.style.fontWeight = 'bold';
      groupHeader.style.backgroundColor = isDarkMode ? '#374151' : '#f0f0f0';
      groupHeader.style.borderBottom = isDarkMode ? '1px solid #4b5563' : '1px solid #ccc';
      dropdown.appendChild(groupHeader);
      
      // Create variable items
      group.items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.innerHTML = item.label;
        itemElement.style.padding = '8px 12px';
        itemElement.style.cursor = 'pointer';
        
        if (index < group.items.length - 1) {
          itemElement.style.borderBottom = isDarkMode ? '1px solid #374151' : '1px solid #eee';
        }
        
        // Hover effect
        itemElement.addEventListener('mouseover', () => {
          itemElement.style.backgroundColor = isDarkMode ? '#374151' : '#f5f5f5';
        });
        
        itemElement.addEventListener('mouseout', () => {
          itemElement.style.backgroundColor = isDarkMode ? '#1f2937' : 'white';
        });
        
        // Click event to insert variable
        itemElement.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.insertVariable(item.value);
        });
        
        dropdown.appendChild(itemElement);
      });
    });
    
    return dropdown;
  }
  
  // Toggle dropdown visibility
  toggleDropdown() {
    if (this.variablesDropdown.style.display === 'none') {
      this.showDropdown();
    } else {
      this.hideDropdown();
    }
  }
  
  // Show dropdown
  showDropdown() {
    const buttonRect = this.variablesButton.getBoundingClientRect();
    this.variablesDropdown.style.top = `${buttonRect.bottom}px`;
    this.variablesDropdown.style.left = `${buttonRect.left}px`;
    this.variablesDropdown.style.display = 'block';
  }
  
  // Hide dropdown
  hideDropdown() {
    this.variablesDropdown.style.display = 'none';
  }
  
  // Insert variable at cursor position
  insertVariable(variable) {
    this.quill.focus();
    const range = this.quill.getSelection(true);
    this.quill.insertText(range.index, variable);
    this.quill.setSelection(range.index + variable.length, 0);
    this.hideDropdown();
  }
}

// Register our module with Quill
Quill.register('modules/variables', VariablesModule);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

// Use forwardRef to pass ref from parent
const RichTextEditor = forwardRef<{ getContent: () => string }, RichTextEditorProps>(({
  value,
  onChange,
  placeholder = 'Write something...',
  height = '400px'
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const hasInitialized = useRef(false);

  // Expose methods to parent component through ref
  useImperativeHandle(ref, () => ({
    // Get the current content of the editor
    getContent: () => {
      if (!quillRef.current) return '';
      
      const html = quillRef.current.root.innerHTML;
      const text = quillRef.current.getText().trim();
      
      // Return empty string if there's no actual content
      if (text === '' && (html === '<p><br></p>' || html === '<p></p>')) {
        return '';
      }
      
      return html;
    }
  }));

  // Initialize Quill editor
  useEffect(() => {
    if (!editorRef.current || !toolbarRef.current || hasInitialized.current) return;
    
    hasInitialized.current = true;

    // Create Quill instance with custom toolbar container
    quillRef.current = new Quill(editorRef.current, {
      modules: {
        toolbar: {
          container: toolbarRef.current,
        },
        variables: true  // Enable our custom variables module
      },
      placeholder,
      theme: 'snow',
      bounds: document.body
    });

    // Prevent any toolbar button from submitting the form
    if (toolbarRef.current) {
      toolbarRef.current.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    }

    // Set initial content
    if (value) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value);
    }

    // Handle content changes
    quillRef.current.on('text-change', () => {
      if (quillRef.current) {
        // Get the raw HTML content
        const html = quillRef.current.root.innerHTML;
        
        // Get the text content (no HTML tags)
        const text = quillRef.current.getText().trim();
        
        // If there's actual text content, or if it's not the default empty state
        // then send the HTML, otherwise send an empty string
        if (text !== '' || (html !== '<p><br></p>' && html !== '<p></p>')) {
          onChange(html);
        } else {
          onChange('');
        }
      }
    });

    // Cleanup on unmount
    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change');
      }
    };
  }, [value, onChange, placeholder]);

  return (
    <div className="quill-editor-container">
      {/* Apply custom styles */}
      <style>{editorStyles}</style>
      
      {/* Custom toolbar container */}
      <div ref={toolbarRef} className="quill-toolbar">
        <span className="ql-formats">
          <button className="ql-bold"></button>
          <button className="ql-italic"></button>
          <button className="ql-underline"></button>
        </span>
        <span className="ql-formats">
          <select className="ql-header" defaultValue="">
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
            <option value="5">Heading 5</option>
            <option value="6">Heading 6</option>
            <option value="">Normal</option>
          </select>
        </span>
        <span className="ql-formats">
          <button className="ql-list" value="ordered"></button>
          <button className="ql-list" value="bullet"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-align" value=""></button>
          <button className="ql-align" value="center"></button>
          <button className="ql-align" value="right"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-link"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-clean"></button>
        </span>
        {/* Variables button will be added by our custom module */}
      </div>
      
      {/* Editor container */}
      <div ref={editorRef} style={{ height: `calc(${height} - 42px)`, overflow: 'auto' }}></div>
    </div>
  );
});

export default RichTextEditor; 