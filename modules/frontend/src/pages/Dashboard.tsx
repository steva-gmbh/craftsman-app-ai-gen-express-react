import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { IconBriefcase, IconUsers, IconCurrencyEuro, IconClock, IconTool, IconBox, IconFilter } from '../components/icons';
import { api } from '../services/api';

export default function Dashboard() {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [customers, jobsResponse, projects, materials, tools] = await Promise.all([
        api.getCustomers(),
        api.getJobs(),
        api.getProjects(),
        api.getMaterials(),
        api.getTools(),
      ]);

      // Get jobs array from the paginated response
      const jobs = jobsResponse.data;

      // Calculate stats
      const totalJobs = jobs.length;
      const activeCustomers = customers.data.length;
      const revenue = jobs.reduce((sum, job) => sum + (job.status === 'COMPLETED' ? 100 : 0), 0); // Assuming €100 per completed job
      const avgResponseTime = '2h'; // This would need to be calculated from actual timestamps
      const totalProjects = projects.data.length;
      const totalMaterials = materials.data.length;
      const totalTools = tools.data.length;

      // Get recent jobs (last 5)
      const recentJobs = jobs
        .slice(0, 5)
        .map(job => ({
          id: job.id,
          customer: customers.data.find(c => c.id === job.customerId)?.name || 'Unknown',
          type: job.title,
          status: job.status,
        }));

      // Get active projects
      const activeProjects = projects.data
        .filter(project => project.status === 'active')
        .slice(0, 5)
        .map(project => ({
          id: project.id,
          name: project.name,
          customer: customers.data.find(c => c.id === project.customerId)?.name || 'Unknown',
          budget: project.budget,
          status: project.status,
        }));

      return {
        stats: [
          { name: 'Total Jobs', value: totalJobs.toString(), icon: IconBriefcase },
          { name: 'Active Customers', value: activeCustomers.toString(), icon: IconUsers },
          { name: 'Revenue', value: `€${revenue}`, icon: IconCurrencyEuro },
          { name: 'Avg. Response Time', value: avgResponseTime, icon: IconClock },
          { name: 'Projects', value: totalProjects.toString(), icon: IconFilter },
          { name: 'Materials', value: totalMaterials.toString(), icon: IconBox },
          { name: 'Tools', value: totalTools.toString(), icon: IconTool },
        ],
        recentJobs,
        activeProjects,
      };
    },
  });

  if (isLoading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return <div>Error loading dashboard data: {error.message}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardData?.stats.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow sm:p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-6 w-6 text-gray-400" stroke={1.5} aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Cards Section */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Projects Card */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Active Projects</h2>
          <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Project Name</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Customer</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                {dashboardData?.activeProjects.length ? (
                  dashboardData.activeProjects.map((project) => (
                    <tr key={project.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{project.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{project.customer}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {project.budget ? `€${project.budget.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">No active projects</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Jobs Card */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Jobs</h2>
          <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Customer</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                {dashboardData?.recentJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{job.customer}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{job.type}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status.toLowerCase() === 'completed' 
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' 
                            : job.status.toLowerCase() === 'in_progress'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                        }`}
                      >
                        {job.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 