import React, { useState } from 'react';
import { X, Search, Plus, Check, SkipForward } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Expert } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface ExpertsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  experts: Expert[];
  selectedExpertId?: string;
  onSelectExpert: (expertId: string) => void;
  onDeselectExpert: () => void;
  onEditExpert: (expert: Expert) => void;
  onCreateExpert: () => void;
  showContinueWithoutExpert?: boolean;
}

export function ExpertsOverlay({
  isOpen,
  onClose,
  experts,
  selectedExpertId,
  onSelectExpert,
  onDeselectExpert,
  onEditExpert,
  onCreateExpert,
  showContinueWithoutExpert = false
}: ExpertsOverlayProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const selectedExpert = experts.find(e => e.id === selectedExpertId);

  const filteredExperts = experts.filter(expert =>
    expert.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedExperts = [...filteredExperts].sort((a, b) => {
    if (a.id === selectedExpertId) return -1;
    if (b.id === selectedExpertId) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Brain;
  };

  const handleExpertClick = (expert: Expert) => {
    if (selectedExpertId === expert.id) {
      onDeselectExpert();
    } else {
      onSelectExpert(expert.id);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[10001] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-[1000px] max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('addExpertChat')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex flex-col sm:flex-row justify-center gap-3">
          {showContinueWithoutExpert && (
             <button
              onClick={onClose}
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
             {t('continueNoExpert')}
              <SkipForward className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onCreateExpert}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="flex-shrink-0" />
            <span>{t('addNewExpert')}</span>
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t('searchExperts')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-3">
            {sortedExperts.map((expert) => {
              const IconComponent = getIconComponent(expert.icon);
              const isSelected = selectedExpertId === expert.id;

              return (
                <div
                  key={expert.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div
                    onClick={() => onEditExpert(expert)}
                    className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer w-full"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <IconComponent size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 break-words">
                        {expert.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 break-words">
                        {expert.description}
                      </p>
                    </div>
                  </div>             
                  <button
                    onClick={() => handleExpertClick(expert)}
                    className={`
                      flex-shrink-0 flex items-center justify-center gap-2 transition-colors
                      text-sm px-4 py-2 rounded-lg
                      sm:w-8 sm:h-8 sm:p-0 sm:rounded-full
                      ${
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 ' + // Mobile/default styles
                            'sm:bg-transparent sm:dark:bg-transparent sm:border-2 sm:text-gray-400 sm:hover:border-blue-500 sm:hover:text-blue-500 sm:hover:bg-transparent' // Desktop overrides
                      }
                    `}
                  >
                    {isSelected ? <Check size={16} /> : <Plus size={16} />}
                    <span className="sm:hidden">
                      {isSelected ? t('expert_selected') : t('expert_add_to_chat')}
                    </span>
                  </button>
                </div>
              );
            })}
            {sortedExperts.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                {t('noExpertsFound')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}