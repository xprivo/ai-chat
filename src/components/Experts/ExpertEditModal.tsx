import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Expert } from '../../types';
import { AVAILABLE_EXPERT_ICONS, validateExpertLimits } from '../../utils/expertsStorage';
import { useTranslation } from '../../hooks/useTranslation';

interface ExpertEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  expert: Expert | null;
  onSave: (expert: Expert) => void;
  onCreate?: (data: Omit<Expert, 'id' | 'createdAt'>) => void;
  onDelete?: (expertId: string) => void;
  isCreating?: boolean;
}

export function ExpertEditModal({
  isOpen,
  onClose,
  expert,
  onSave,
  onCreate,
  onDelete,
  isCreating = false
}: ExpertEditModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [icon, setIcon] = useState('Brain');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (expert && !isCreating) {
      setName(expert.name);
      setDescription(expert.description);
      setInstructions(expert.instructions);
      setIcon(expert.icon);
    } else if (isCreating) {
      setName('');
      setDescription('');
      setInstructions('');
      setIcon('Brain');
    }
  }, [expert, isCreating]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const validation = await validateExpertLimits(name, description, instructions);
    if (!validation.valid) {
      setError(validation.error || t('validation_invalid_input'));
      return;
    }

    if (!name.trim()) {
      setError(t('expert_error_name_required'));
      return;
    }

    if (isCreating && onCreate) {
      onCreate({
        name: name.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        icon
      });
    } else if (expert) {
      onSave({
        ...expert,
        name: name.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        icon
      });
    }

    setError('');
    onClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (expert && onDelete) {
      onDelete(expert.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Brain;
  };

  const IconComponent = getIconComponent(icon);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[10002] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl  w-[1000px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
       <div className="flex items-start justify-between gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isCreating ? t('createExpert') : t('editExpert')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <IconComponent size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
                {t('changeExpertIcon')}
            </button>
            {showIconPicker && (
             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              {AVAILABLE_EXPERT_ICONS.map((iconName) => {
                const Icon = getIconComponent(iconName);
                return (
                  <button
                    key={iconName}
                    onClick={() => {
                      setIcon(iconName);
                      setShowIconPicker(false);
                    }}
                    className={`p-3 rounded-lg transition-colors whitespace-nowrap ${
                      icon === iconName
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Icon size={24} className="shrink-0" />
                  </button>
                );
              })}
            </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('expertName')} <span className="text-gray-400">({name.length}/30)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 30))}
              placeholder={t('enter_expert_name')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               {t('expertDescription')} <span className="text-gray-400">({description.length}/60)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 60))}
              placeholder={t('short_description')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('expertInstructions')} <span className="text-gray-400">({instructions.length}/1500)</span>
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value.slice(0, 1500))}
              placeholder={t('expert_instruction_knowledge')}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          {!isCreating && expert && onDelete && (
            <button
              onClick={handleDeleteClick}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {t('deleteExpert')}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('cancelExpert')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isCreating ? t('createButton') : t('saveButton')}
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[10003] flex items-center justify-center p-4" onClick={handleDeleteCancel}>
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-[1000px] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('deleteExpertQuestion')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('deleteExpertConfirmation', { name: expert?.name })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('cancelExpert')}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                 {t('deleteExpert')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
