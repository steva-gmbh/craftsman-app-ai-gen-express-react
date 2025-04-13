import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../providers/ThemeProvider';
import {
  IconHome,
  IconUsers,
  IconBriefcase,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconBox,
  IconTool,
  IconUsersGroup,
} from './icons';

interface SidebarProps {
  open: boolean;
}

// Get current user to check if they have admin role
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    return {};
  }
};

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const location = useLocation();
  const { theme } = useTheme();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  // Base navigation items
  const baseNavigation = [
    { name: 'Dashboard', href: '/', icon: IconHome },
    { name: 'Customers', href: '/customers', icon: IconUsersGroup },
    { name: 'Jobs', href: '/jobs', icon: IconBriefcase },
    { name: 'Materials', href: '/materials', icon: IconBox },
    { name: 'Tools', href: '/tools', icon: IconTool },
  ];

  // Admin-only navigation items
  const adminNavigation = [
    { name: 'Users', href: '/users', icon: IconUsers },
  ];

  // Settings is shown to all users
  const settingsNavigation = [
    { name: 'Settings', href: '/settings', icon: IconSettings },
  ];

  // Combine navigation items based on user role
  const navigation = [
    ...baseNavigation,
    ...(isAdmin ? adminNavigation : []),
    ...settingsNavigation
  ];

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