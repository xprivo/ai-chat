import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { capacitorStorage } from '../../utils/capacitorStorage';
import { useTranslation } from '../../hooks/useTranslation';

export function ThinkingMessage() {
  const { t } = useTranslation();
  const [dots, setDots] = useState('');
  const [assistantIconUrl, setAssistantIconUrl] = useState<string | null>(() =>
    Capacitor.isNativePlatform() ? null : localStorage.getItem('assistantIcon')
  );

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

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    capacitorStorage.getItem('assistantIcon').then(val => {
      setAssistantIconUrl(val);
    });

    const handler = () => {
      capacitorStorage.getItem('assistantIcon').then(val => {
        setAssistantIconUrl(val);
      });
    };
    window.addEventListener('assistantIconUpdated', handler);
    return () => window.removeEventListener('assistantIconUpdated', handler);
  }, []);

  const getAssistantIcon = () => {
    if (assistantIconUrl) {
      return (
        <img
          src={assistantIconUrl}
          alt="Assistant"
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            capacitorStorage.removeItem('assistantIcon');
            setAssistantIconUrl(null);
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    return <Bot size={16} />;
  };

  return (
    <div className="w-full max-w-full">
      <div className="block sm:hidden mb-2">
        <div className="flex justify-start">
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-600 text-white">
            {getAssistantIcon()}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
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
