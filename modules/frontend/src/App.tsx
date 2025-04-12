import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './providers/ThemeProvider';
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
import { api, Customer, Job } from './services/api';

const queryClient = new QueryClient();

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : true;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('user');
  });

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
        const [customersData, jobsData] = await Promise.all([
          api.getCustomers(),
          api.getJobs(),
        ]);
        setCustomers(customersData);
        setJobs(jobsData);
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
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {isAuthenticated ? (
              <div className="flex h-screen">
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
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
                              </Routes>
                            )}
                          </div>
                        </div>
                      </main>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            )}
            <Toaster position="top-right" />
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 