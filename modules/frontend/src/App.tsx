import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './providers/ThemeProvider';
import { WebSocketProvider } from './contexts/WebSocketContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import CustomerForm from './pages/CustomerForm';
import JobForm from './pages/JobForm';
import Materials from './pages/Materials';
import MaterialForm from './pages/MaterialForm';
import Tools from './pages/Tools';
import ToolForm from './pages/ToolForm';
import Login from './pages/Login';
import Users from './pages/Users';
import UserForm from './pages/UserForm';
import Projects from './pages/Projects';
import ProjectForm from './pages/ProjectForm';
import Invoices from './pages/Invoices';
import InvoiceForm from './pages/InvoiceForm';
import Vehicles from './pages/Vehicles';
import VehicleForm from './pages/VehicleForm';
import Templates from './pages/Templates';
import TemplateForm from './pages/TemplateForm';
import UserSettingsDialog from './components/UserSettingsDialog';
import { api, Customer, Job } from './services/api';

const queryClient = new QueryClient();

function App() {
  // @ts-ignore
  const [customers, setCustomers] = useState<Customer[]>([]);
  // @ts-ignore
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : true;
  });
  // @ts-ignore
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('user');
  });
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarOpen');
    setSidebarOpen(saved ? JSON.parse(saved) : true);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [customersResponse, jobsResponse] = await Promise.all([
          api.getCustomers(),
          api.getJobs(),
        ]);

        setCustomers(customersResponse.data || []);
        setJobs(jobsResponse.data || []);

        setError(null);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <WebSocketProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              {isAuthenticated ? (
                <div className="flex h-screen">
                  <Navbar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    onOpenUserSettings={() => setIsUserSettingsOpen(true)}
                  />
                  <Sidebar open={sidebarOpen} />
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
                        <main className="flex-1 pt-16">
                          <div className="py-6">
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                              {error ? (
                                <div className="text-red-500 dark:text-red-400">{error}</div>
                              ) : (
                                <Routes>
                                  <Route path="/" element={<Dashboard />} />
                                  <Route path="/jobs" element={<Jobs />} />
                                  <Route path="/customers" element={<Customers />} />
                                  <Route path="/settings" element={<Settings />} />
                                  <Route path="/customers/new" element={<CustomerForm />} />
                                  <Route path="/customers/:id" element={<CustomerForm />} />
                                  <Route path="/jobs/new" element={<JobForm />} />
                                  <Route path="/jobs/:id" element={<JobForm />} />
                                  <Route path="/materials" element={<Materials />} />
                                  <Route path="/materials/new" element={<MaterialForm />} />
                                  <Route path="/materials/:id" element={<MaterialForm />} />
                                  <Route path="/tools" element={<Tools />} />
                                  <Route path="/tools/new" element={<ToolForm />} />
                                  <Route path="/tools/:id" element={<ToolForm />} />
                                  <Route path="/users" element={<Users />} />
                                  <Route path="/users/new" element={<UserForm />} />
                                  <Route path="/users/:id" element={<UserForm />} />
                                  <Route path="/projects" element={<Projects />} />
                                  <Route path="/projects/new" element={<ProjectForm />} />
                                  <Route path="/projects/:id" element={<ProjectForm />} />
                                  <Route path="/invoices" element={<Invoices />} />
                                  <Route path="/invoices/new" element={<InvoiceForm />} />
                                  <Route path="/invoices/:id" element={<InvoiceForm />} />
                                  <Route path="/invoices/:id/edit" element={<InvoiceForm />} />
                                  <Route path="/vehicles" element={<Vehicles />} />
                                  <Route path="/vehicles/new" element={<VehicleForm />} />
                                  <Route path="/vehicles/:id" element={<VehicleForm />} />
                                  <Route path="/templates" element={<Templates />} />
                                  <Route path="/templates/new" element={<TemplateForm />} />
                                  <Route path="/templates/:id/edit" element={<TemplateForm />} />
                                </Routes>
                              )}
                            </div>
                          </div>
                        </main>
                      </div>
                    </div>
                  </div>
                  <UserSettingsDialog
                    isOpen={isUserSettingsOpen}
                    onClose={() => setIsUserSettingsOpen(false)}
                  />
                </div>
              ) : (
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              )}
              <Toaster 
                position="top-right" 
                toastOptions={{
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-text)',
                    borderRadius: '0.375rem',
                    boxShadow: 'var(--toast-shadow)',
                    border: '1px solid var(--toast-border)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: 'white',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: 'white',
                    },
                  },
                }}
              />
            </div>
          </WebSocketProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
