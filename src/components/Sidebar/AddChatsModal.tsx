import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Workspace, Chat } from '../../types';

interface AddChatsModalProps {
  isOpen: boolean;
  workspace: Workspace | null;
  allChats: Chat[];
  onClose: () => void;
  onAddChatsToWorkspace: (workspaceId: string, chatIds: string[]) => void;
}
 
export function AddChatsModal({ isOpen, workspace, allChats, onClose, onAddChatsToWorkspace }: AddChatsModalProps) {
  const { t } = useTranslation();
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);

  const availableChats = allChats.filter(chat => !chat.workspaceId || (workspace && chat.workspaceId !== workspace.id));

  useEffect(() => {
    if (!isOpen) {
      setSelectedChatIds([]);
    }
  }, [isOpen]);

  const toggleChatSelection = (chatId: string) => {
    setSelectedChatIds(prev => 
      prev.includes(chatId) 
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleSubmit = () => {
    if (!workspace || selectedChatIds.length === 0) return;

    onAddChatsToWorkspace(workspace.id, selectedChatIds);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('workspaceChatsUpdated', { 
        detail: { workspaceId: workspace.id, action: 'added', chatIds: selectedChatIds }
      }));
      window.dispatchEvent(new Event('storage'));
    }, 10);
    
    setSelectedChatIds([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedChatIds([]);
    onClose();
  };

  if (!workspace) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={t('addChatsToWorkspace')}>
      <div className="space-y-4 p-4 sm:p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('selectChatsToAdd')}
        </p>
        
        <div className="space-y-2 max-h-64 overflow-auto">
          {availableChats.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              {t('noChatsYet')}
            </p>
          ) : (
            availableChats.map((chat) => (
              <label key={chat.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedChatIds.includes(chat.id)}
                  onChange={() => toggleChatSelection(chat.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900 dark:text-white truncate">
                  {chat.title}
                </span>
              </label>
            ))
          )}
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={selectedChatIds.length === 0}>
            {t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}