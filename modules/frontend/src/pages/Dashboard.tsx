import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BriefcaseIcon, UserGroupIcon, CurrencyEuroIcon, ClockIcon } from '@heroicons/react/24/outline';
import { api } from '../services/api';

export default function Dashboard() {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [customers, jobs] = await Promise.all([
        api.getCustomers(),
        api.getJobs(),
      ]);

      // Calculate stats
      const totalJobs = jobs.length;
      const activeCustomers = customers.length;
      const revenue = jobs.reduce((sum, job) => sum + (job.status === 'COMPLETED' ? 100 : 0), 0); // Assuming €100 per completed job
      const avgResponseTime = '2h'; // This would need to be calculated from actual timestamps

      // Get recent jobs (last 5)
      const recentJobs = jobs
        .slice(0, 5)
        .map(job => ({
          id: job.id,
          customer: customers.find(c => c.id === job.customerId)?.name || 'Unknown',
          type: job.title,
          status: job.status,
        }));

      return {
        stats: [
          { name: 'Total Jobs', value: totalJobs.toString(), icon: BriefcaseIcon },
          { name: 'Active Customers', value: activeCustomers.toString(), icon: UserGroupIcon },
          { name: 'Revenue', value: `€${revenue}`, icon: CurrencyEuroIcon },
          { name: 'Avg. Response Time', value: avgResponseTime, icon: ClockIcon },
        ],
        recentJobs,
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
                <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
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

      {/* Recent Jobs */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Jobs</h2>
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
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
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{job.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 