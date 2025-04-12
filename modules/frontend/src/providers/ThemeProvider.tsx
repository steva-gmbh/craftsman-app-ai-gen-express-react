import React, { createContext, useContext, useEffect, useState } from 'react';
import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setTheme: (theme) => set({ theme }),
}));

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeState = useThemeStore();

  useEffect(() => {
    // Fetch theme from database on initial load
    const fetchTheme = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/settings');
        const data = await response.json();
        if (data?.appearance) {
          const appearance = JSON.parse(data.appearance);
          if (appearance.theme) {
            themeState.setTheme(appearance.theme);
          }
        }
      } catch (error) {
        console.error('Error fetching theme:', error);
      }
    };
    fetchTheme();
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(themeState.theme);
  }, [themeState.theme]);

  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 