import React from 'react';
import { Loader2 } from 'lucide-react';
import { Portal } from './Portal';
import { useTranslation } from '../../hooks/useTranslation';

interface AccountCreationOverlayProps {
  isOpen: boolean;
}

export function AccountCreationOverlay({ isOpen }: AccountCreationOverlayProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
             {t('account_creation')}
            </h2>

            <p className="text-gray-600 dark:text-gray-400">
              {t('account_creation_text')}
            </p>
          </div>
        </div>
      </div>
    </Portal>
  );
}
