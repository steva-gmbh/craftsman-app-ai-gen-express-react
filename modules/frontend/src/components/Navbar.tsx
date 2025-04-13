import React from 'react';
import { Link } from 'react-router-dom';
import UserProfile from './UserProfile';
import AIAssistant from './AIAssistant';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onOpenUserSettings?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen, onOpenUserSettings }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow">
      <div className="mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center pl-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <Link to="/" className="ml-4 text-xl font-bold text-gray-900 dark:text-white">
              CraftsmanApp
            </Link>
          </div>
          <div className="flex items-center pr-4 space-x-2">
            <AIAssistant />
            <UserProfile onOpenSettings={onOpenUserSettings} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 