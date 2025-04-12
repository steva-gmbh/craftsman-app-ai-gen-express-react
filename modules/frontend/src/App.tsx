import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { api, Customer, Job } from './services/api';

const queryClient = new QueryClient();

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Initialize from localStorage or default to true
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    // Save to localStorage whenever sidebar state changes
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
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div
              className={`transition-all duration-300 ease-in-out ${
                sidebarOpen ? 'ml-64' : 'ml-16'
              }`}
            >
              <header className="bg-white dark:bg-gray-800 shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">HandwerkerApp</h1>
                </div>
              </header>
              <main className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/customers/new" element={<CustomerForm />} />
                    <Route path="/customers/:id/edit" element={<CustomerForm />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/new" element={<JobForm />} />
                    <Route path="/jobs/:id/edit" element={<JobForm />} />
                    <Route path="/materials" element={<Materials />} />
                    <Route path="/materials/new" element={<MaterialForm />} />
                    <Route path="/materials/:id/edit" element={<MaterialForm />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
          <Toaster position="top-right" />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 