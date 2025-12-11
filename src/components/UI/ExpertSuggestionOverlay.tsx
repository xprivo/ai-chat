import React from 'react';
import { SkipForward, Search } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface ExpertSuggestionOverlayProps {
  isOpen: boolean;
  onBrowseExperts: () => void;
  onMaybeLater: () => void;
}

export function ExpertSuggestionOverlay({
  isOpen,
  onBrowseExperts,
  onMaybeLater
}: ExpertSuggestionOverlayProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-[1000px] shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
            {t('expert_suggestion_title')}
          </h2>

          <p className="text-md text-gray-600 dark:text-gray-400 mb-6 text-center">
            {t('expert_suggestion_description')}
          </p>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-500 dark:text-blue-400 mr-2">•</span>
                <span>{t('expert_suggestion_example_programming')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 dark:text-blue-400 mr-2">•</span>
                <span>{t('expert_suggestion_example_writing')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 dark:text-blue-400 mr-2">•</span>
                <span>{t('expert_suggestion_example_custom')}</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onBrowseExperts}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-gray-800"
            >
              <Search className="w-5 h-5" />
              {t('expert_suggestion_browse_button')}
            </button>

            <button
              onClick={onMaybeLater}
              className="flex-1 flex items-center justify-center gap-2
                bg-black text-white 
                dark:bg-gray-200 dark:text-black 
                hover:bg-gray-800 
                dark:hover:bg-gray-300 
                font-medium py-3 px-6 rounded-lg 
                transition-colors duration-200 
                focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-blue-500 focus:ring-offset-white 
                dark:focus:ring-blue-500 dark:focus:ring-offset-gray-900"
            >
              {t('expert_suggestion_skip_button')}
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}