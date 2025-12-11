import React, { useState } from 'react';
import { X, MessageCircle, Plus, Search, SkipForward } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Expert } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface ExpertsListViewProps {
  isOpen: boolean;
  onClose: () => void;
  experts: Expert[];
  onChatWithExpert: (expertId: string) => void;
  onEditExpert: (expert: Expert) => void;
  onCreateExpert: () => void;
  showContinueWithoutExpert?: boolean;
}

export function ExpertsListView({
  isOpen,
  onClose,
  experts,
  onChatWithExpert,
  onEditExpert,
  onCreateExpert,
  showContinueWithoutExpert = false
}: ExpertsListViewProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Brain;
  };

  const filteredExperts = experts
    .filter(expert =>
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-[1000px] max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white break-words">
              {t('experts')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
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
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchExperts')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-center">
            <button
              onClick={onCreateExpert}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} className="flex-shrink-0" /> 
              <span>{t('addNewExpert')}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredExperts.map((expert) => {
              const IconComponent = getIconComponent(expert.icon);

              return (
                <div
                  key={expert.id}
                  className="flex flex-col items-start sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div
                    onClick={() => onEditExpert(expert)}
                    className="flex items-center gap-4 flex-1 cursor-pointer w-full"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <IconComponent size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {expert.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {expert.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onChatWithExpert(expert.id)}
                   className="w-fit sm:w-auto flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span className="text-sm">{t('expert_chat')}</span>
                  </button>
                </div>
              );
            })}
            {filteredExperts.length === 0 && experts.length > 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
               {t('no_experts_found')}
              </p>
            )}
            {experts.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
               {t('no_experts_available')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}