import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface ExpertLimitOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpertLimitOverlay({ isOpen, onClose }: ExpertLimitOverlayProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[10004] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-[1000px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertCircle className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
          </div>
          <div className="flex-1 min-w-0"> 
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('expertLimitReached')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('expertLimitReachedText')}
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
               {t('modal_close')}
            </button>
          </div>
    
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
