import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get saved theme from localStorage or default to 'system'
    const savedTheme = localStorage.getItem('vaultbank-dashboard-theme') as Theme;
    return savedTheme || 'system';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Check if current route supports theming (dashboard, admin, or bank routes)
  const isThemeSupportedRoute = location.pathname.startsWith('/dashboard') || 
                                 location.pathname.startsWith('/admin') || 
                                 location.pathname.startsWith('/bank');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');

    if (!isThemeSupportedRoute) {
      // For non-supported routes, remove theme and reset to default
      root.style.removeProperty('color-scheme');
      setActualTheme('light');
      return;
    }

    let effectiveTheme: 'light' | 'dark';

    if (theme === 'system') {
      // Check system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      effectiveTheme = systemTheme;
    } else {
      effectiveTheme = theme;
    }

    // Apply theme with smooth transition (only for dashboard routes)
    root.style.setProperty('color-scheme', effectiveTheme);
    root.classList.add(effectiveTheme);
    setActualTheme(effectiveTheme);

    // Save to localStorage
    localStorage.setItem('vaultbank-dashboard-theme', theme);
  }, [theme, isThemeSupportedRoute]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system' || !isThemeSupportedRoute) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      root.style.setProperty('color-scheme', systemTheme);
      setActualTheme(systemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, isThemeSupportedRoute]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      // If system, toggle to opposite of current actual theme
      return actualTheme === 'dark' ? 'light' : 'dark';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
