import { useState, useEffect } from 'react';
import { Theme } from '../types';
import { storage } from '../utils/storage';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system'); // Default value

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await storage.settings.get('theme');
        if (stored) {
          setTheme(stored as Theme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    const saveTheme = async () => {
      try {
        await storage.settings.set('theme', theme);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    };

    saveTheme();
    
    const applyTheme = () => {
      const root = document.documentElement;
      const isDark = theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.classList.remove('dark', 'light');
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyTheme();
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return { theme, setTheme };
}