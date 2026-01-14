import React, { useState, useEffect } from 'react';
import { X, Copy } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Portal } from './Portal';
import { useTranslation } from '../../hooks/useTranslation';

interface SplitChatOverlayProps {
  isOpen: boolean;
  currentTitle: string;
  onClose: () => void;
  onConfirm: (newTitle: string) => void;
}

export function SplitChatOverlay({ isOpen, currentTitle, onClose, onConfirm }: SplitChatOverlayProps) {
  const [newTitle, setNewTitle] = useState(`${currentTitle} [copy]`);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      setNewTitle(`${currentTitle} [copy]`); 
    }
  }, [isOpen, currentTitle]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (newTitle.trim()) {
      onConfirm(newTitle.trim());
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleOverlayClick}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-[1000px] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('split_message')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('makes_copy_chat')}
          </p>

          <div className="mb-6">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
              placeholder=""
              className="w-full"
              autoFocus
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!newTitle.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Copy size={16} className="mr-2" />
              {t('copy_chat')}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
