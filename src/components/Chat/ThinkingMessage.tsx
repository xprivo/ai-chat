import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';

export function ThinkingMessage() {
  const [dots, setDots] = useState('');
 
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '') return '.';
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Get custom assistant icon from localStorage or use default
  const getAssistantIcon = () => {
    const customIcon = localStorage.getItem('assistantIcon');
    if (customIcon) {
      return (
        <img
          src={customIcon}
          alt="Assistant"
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // Fallback to default icon if custom image fails to load
            localStorage.removeItem('assistantIcon');
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="m12 7 2 4H10l2-4Z"/></svg>';
          }}
        />
      );
    }
    return <Bot size={16} />;
  };

  return (
    <div className="w-full max-w-full">
      {/* Mobile: Avatar above message */}
      <div className="block sm:hidden mb-2">
        <div className="flex justify-start">
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-600 text-white">
            {getAssistantIcon()}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {/* Desktop avatar */}
        <div className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center flex-shrink-0 bg-gray-600 text-white">
          {getAssistantIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="inline-block p-3 sm:p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white relative overflow-hidden max-w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent animate-shimmer"></div>
            
            <div className="relative z-10 break-words">
              <span className="font-medium">{t('thinks')}</span>
              <span className="inline-block w-6 text-left">{dots}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}