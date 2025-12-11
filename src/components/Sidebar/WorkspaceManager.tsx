import React, { useState } from 'react';
import { useEffect } from 'react';
import { Plus, Minus, Edit3, Users, ArrowLeft, Pin, PinOff, Trash2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Workspace, Chat } from '../../types';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import { Portal } from '../UI/Portal';

interface WorkspaceManagerProps {
  workspace: Workspace;
  chats: Chat[];
  allChats: Chat[];
  onSelectChat: (chatId: string) => void;
  onNewChatInWorkspace: (workspaceId: string) => void;
  onAddChatsToWorkspace: (workspaceId: string, chatIds: string[]) => void;
  onRemoveChatsFromWorkspace: (workspaceId: string, chatIds: string[]) => void;
  onUpdateWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: (workspaceId: string) => void;
  onBack: () => void;
  selectedChatId?: string;
}

export function WorkspaceManager({
  workspace,
  chats,
  allChats,
  onSelectChat,
  onNewChatInWorkspace,
  onAddChatsToWorkspace,
  onRemoveChatsFromWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
  onBack,
  selectedChatId
}: WorkspaceManagerProps) {
  const { t } = useTranslation();
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chatTitles, setChatTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    const titles = Object.fromEntries(
      chats.map(chat => [chat.id, chat.title])
    );
    setChatTitles(titles);
  }, [chats]);

  useEffect(() => {
    const handleChatTitleUpdate = (event: CustomEvent) => {
      const { chatId, title } = event.detail;
      setChatTitles(prev => ({
        ...prev,
        [chatId]: title
      }));
    };
 
    window.addEventListener('chatTitleUpdated', handleChatTitleUpdate as EventListener);
    return () => {
      window.removeEventListener('chatTitleUpdated', handleChatTitleUpdate as EventListener);
    };
  }, []);

  const handleTogglePin = () => {
    const updatedWorkspace = {
      ...workspace,
      isPinned: !workspace.isPinned
    };
    
    onUpdateWorkspace(updatedWorkspace);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('workspaceUpdated', { 
        detail: { workspaceId: workspace.id, workspace: updatedWorkspace }
      }));
      window.dispatchEvent(new Event('storage'));
    }, 10);
  };

  const handleEditWorkspace = () => {
    setShowEditMenu(false);
    window.dispatchEvent(new CustomEvent('showEditWorkspaceModal', {
      detail: { workspace }
    }));
  };

  const handleAddChats = () => {
    setShowEditMenu(false);
    window.dispatchEvent(new CustomEvent('showAddChatsModal', {
      detail: { workspace, allChats }
    }));
  };

  const handleRemoveChats = () => {
    setShowEditMenu(false);
    // Dispatch event to show remove chats modal at App level
    window.dispatchEvent(new CustomEvent('showRemoveChatsModal', {
      detail: { workspace, chats }
    }));
  };

  const handleDeleteWorkspace = () => {
    setShowEditMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteWorkspaceConfirm = () => {
    onDeleteWorkspace(workspace.id);
    setShowDeleteConfirm(false);
    onBack();
  };

  return (
    <>
      <div className="px-3 sm:px-4 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl shadow-sm">
          <div className="px-3 py-3 border-b border-blue-100 dark:border-blue-900/50">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={18} />
              <span className="text-[13px]">{t('backToWorkspaces')}</span>
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleTogglePin}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {workspace.isPinned ? (
                  <>
                    <PinOff size={16} />
                  </>
                ) : (
                  <>
                    <Pin size={16} />
                  </>
                )}
              </button>
              <button
                onClick={() => setShowEditMenu(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Edit3 size={16} />
                <span>{t('edit')}</span>
              </button>
            </div>
          </div>

          <div className="px-3 py-3">
            <div className="flex items-center gap-2 mb-3">
              {workspace.isPinned && <Pin size={14} className="text-blue-600 dark:text-blue-400" />}
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {workspace.name}
              </h3>
              {chats.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">({chats.length})</span>
              )}
            </div>

            <div className="mb-3">
              <Button
                onClick={() => onNewChatInWorkspace(workspace.id)}
                className="w-full justify-center"
                size="sm"
              >
                <Plus size={16} className="mr-2" />
                {t('newChat')}
              </Button>
            </div>

            {chats.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                {t('noChatsYet')}
              </p>
            ) : (
              <div className="space-y-1">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`w-full text-left px-2 py-2.5 sm:py-2 rounded-lg text-sm truncate transition-colors ${
                      selectedChatId === chat.id
                        ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    {chat.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditMenu && (
        <Portal>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4"
            onClick={() => setShowEditMenu(false)}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[1000px] max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('editWorkspace')}</h2>
                <button
                  onClick={() => setShowEditMenu(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  ✕
                </button>
              </div>
             <div className="p-6 space-y-3 flex flex-col items-center">
                <Button
                  onClick={handleEditWorkspace}
                  variant="outline"
                  className="w-[600px] max-w-full justify-center"
                >
                  <Edit3 size={16} className="mr-2" />
                  {t('editWorkspace')}
                </Button>
                
                <Button
                  onClick={handleAddChats}
                  variant="outline"
                  className="w-[600px] max-w-full justify-center"
                >
                  <Plus size={16} className="mr-2" />
                  {t('addChats')}
                </Button>
                
                {chats.length > 0 && (
                  <Button
                    onClick={handleRemoveChats}
                    variant="outline"
                    className="w-[600px] max-w-full justify-center"
                  >
                    <Minus size={16} className="mr-2" />
                    {t('removeChats')}
                  </Button>
                )}

              <Button
                onClick={handleDeleteWorkspace}
                variant="outline"
                className="w-[500px] max-w-full justify-center text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
              >
                <Trash2 size={16} className="mr-2" />
                {t('deleteWorkspace')}
              </Button>
              </div>
            
            </div>
          </div>
        </Portal>
      )}

      {/* Delete Workspace Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t('confirmDeleteWorkspace')}
      >
        <div className="space-y-4 p-4 sm:p-6">
          <p className="text-gray-700 dark:text-gray-300">
            {t('deleteWorkspaceConfirmation')}
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              {t('no')}
            </Button>
            <Button 
              onClick={handleDeleteWorkspaceConfirm} 
              className="bg-red-600 hover:bg-red-700"
            >
              {t('yesDelete')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}