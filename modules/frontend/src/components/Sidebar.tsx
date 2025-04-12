import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../providers/ThemeProvider';
import {
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  open: boolean;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Customers', href: '/customers', icon: UserGroupIcon },
  { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
  { name: 'Materials', href: '/materials', icon: CubeIcon },
  { name: 'Tools', href: '/tools', icon: WrenchScrewdriverIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const location = useLocation();
  const { theme } = useTheme();

  return (
    <div className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] transform bg-white dark:bg-gray-800 transition-all duration-200 ease-in-out overflow-y-auto ${open ? 'w-64' : 'w-20'}`}>
      <nav className="mt-5 px-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`${
              location.pathname === item.href
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
          >
            <item.icon className={`${
              location.pathname === item.href
                ? 'text-gray-500 dark:text-gray-300'
                : 'text-gray-400 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
            } mr-4 h-6 w-6 flex-shrink-0`} />
            <span className={`${
              open 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 translate-x-10 invisible'
            } transform transition-all duration-300 ease-in-out whitespace-nowrap`}>
              {item.name}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 