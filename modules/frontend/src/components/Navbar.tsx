import React from 'react';
import { useTheme } from '../providers/ThemeProvider';

interface NavbarProps {
  sidebarOpen: boolean;
}

export default function Navbar({ sidebarOpen }: NavbarProps) {
  const { theme } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            HandwerkerApp
          </span>
        </div>
      </div>
    </nav>
  );
} 