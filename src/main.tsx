import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeCapacitor } from './utils/capacitorInit';

const applyInitialTheme = () => {
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('theme') || 'system';
  const isDark = storedTheme === 'dark' ||
    (storedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  root.classList.remove('dark', 'light');

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.add('light');
  }

};

// Initialize app
(async () => {
  await initializeCapacitor();

  // Apply theme immediately
  applyInitialTheme();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
})();