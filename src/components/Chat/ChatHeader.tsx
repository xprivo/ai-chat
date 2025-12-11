import React, { useState, useEffect } from 'react';
import { Settings, Trash2, FileText, Menu, SmilePlus } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Chat, Workspace, Expert } from '../../types';
import { ChatSettings } from './ChatSettings';
import { FileManager } from './FileManager';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { ExpertsOverlay } from '../Experts/ExpertsOverlay';
import { ExpertEditModal } from '../Experts/ExpertEditModal';
import { ExpertLimitOverlay } from '../UI/ExpertLimitOverlay';

import { getTonePreference, saveTonePreference } from '../../utils/toneStorage';

interface ChatHeaderProps {
  chat: Chat;
  fileCount: number;
  files: Record<string, string>;
  images: Record<string, string>;
  onUpdateChatTitle: (title: string) => void;
  onUpdateTemperature: (temperature: number) => void;
  onUpdateSystemPrompt: (systemPrompt: string) => void;
  onDeleteChat: () => void;
  onMentionFile: (fileName: string) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  workspaces: Workspace[];
  experts: Expert[];
  onUpdateExperts: (experts: Expert[]) => void;
  onDeleteExpert: (expertId: string) => void;
  onUpdateChat: (chat: Chat) => void;
}

export function ChatHeader({
  chat,
  fileCount,
  files,
  images,
  onUpdateChatTitle,
  onUpdateTemperature,
  onUpdateSystemPrompt,
  onDeleteChat,
  onMentionFile,
  onToggleSidebar,
  isSidebarOpen,
  workspaces,
  experts,
  onUpdateExperts,
  onDeleteExpert,
  onUpdateChat
}: ChatHeaderProps) {
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExpertsOverlay, setShowExpertsOverlay] = useState(false);
  const [showExpertEdit, setShowExpertEdit] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [isCreatingExpert, setIsCreatingExpert] = useState(false);
  const [showExpertLimitOverlay, setShowExpertLimitOverlay] = useState(false);
  const [selectedToneId, setSelectedToneId] = useState<string | null>(null);

  useEffect(() => {
    const loadTonePreference = async () => {
      const toneId = await getTonePreference();
      setSelectedToneId(toneId);
    };
    loadTonePreference();

    const handleToneChange = () => {
      loadTonePreference();
    };

    window.addEventListener('tonePreferenceChanged', handleToneChange);
    return () => window.removeEventListener('tonePreferenceChanged', handleToneChange);
  }, []);
  
  const handleDeleteConfirm = () => {
    onDeleteChat();
    setShowDeleteConfirm(false);
  };

  const isWorkspaceChat = !!chat.workspaceId;
  const selectedExpert = chat.expertId ? experts.find(e => e.id === chat.expertId) : null;
  const hasExpert = !!chat.expertId;

  const handleExpertButtonClick = () => {
    setShowExpertsOverlay(true);
  };

  const handleSelectExpert = (expertId: string) => {
    const updatedChat = { ...chat, expertId, updatedAt: new Date() };
    onUpdateChat(updatedChat);
    setShowExpertsOverlay(false);
  };

  const handleDeselectExpert = () => {
    const updatedChat = { ...chat, expertId: undefined, updatedAt: new Date() };
    onUpdateChat(updatedChat);
    setShowExpertsOverlay(false);
  };

  const handleEditExpert = (expert: Expert) => {
    setEditingExpert(expert);
    setIsCreatingExpert(false);
    setShowExpertEdit(true);
  };

  const handleCreateExpert = () => {
    if (experts.length >= 40) {
      setShowExpertLimitOverlay(true);
      return;
    }
    setEditingExpert(null);
    setIsCreatingExpert(true);
    setShowExpertEdit(true);
  };

  const handleSaveExpert = (expert: Expert) => {
    const updatedExperts = experts.map(e => e.id === expert.id ? expert : e);
    onUpdateExperts(updatedExperts);
    setShowExpertEdit(false);
  };

  const handleCreateExpertSave = (data: Omit<Expert, 'id' | 'createdAt'>) => {
    const newExpert: Expert = {
      ...data,
      id: `expert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    const updatedExperts = [...experts, newExpert];
    onUpdateExperts(updatedExperts);
    setShowExpertEdit(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 5px)' }}>
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {!isSidebarOpen && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="relative lg:hidden p-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
              
              {selectedToneId && selectedToneId !== 'standard' && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-xs font-semibold text-white bg-red-500 rounded-full">
                  1
                </span>
              )}
            </button>
          )}

          <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate pr-2 flex-1 min-w-0 max-w-full overflow-hidden">
            {chat.title}
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {fileCount > 0 && (
            <button
              onClick={() => setShowFiles(true)}
              className="relative p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={t('viewFiles')}
            >
              <FileText size={18} className="sm:w-5 sm:h-5" />
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs">
                {fileCount}
              </span>
            </button>
          )}

          {!isWorkspaceChat && (
            <button
              onClick={handleExpertButtonClick}
              className="relative p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Expert"
            >
              <SmilePlus size={18} className="sm:w-5 sm:h-5" />
              {hasExpert && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs">
                  1
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={t('settings')}
          >
            <Settings size={18} className="sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 sm:p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title={t('deleteChat')}
          >
            <Trash2 size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title={t('chatSettings')}
      >
        <ChatSettings
          chat={chat}
          temperature={chat.temperature ?? 0.2}
          onUpdateChatTitle={onUpdateChatTitle}
          onUpdateTemperature={onUpdateTemperature}
          onUpdateSystemPrompt={onUpdateSystemPrompt}
          onClose={() => setShowSettings(false)}
        />
      </Modal>

      <Modal
        isOpen={showFiles}
        onClose={() => setShowFiles(false)}
        title={t('filesInChat')}
      >
        <div className="p-4 sm:p-6">
          <FileManager
            files={files}
            images={images}
            onMentionFile={onMentionFile}
            onClose={() => setShowFiles(false)}
          />
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t('deleteChat')}
      >
        <div className="space-y-4 p-4 sm:p-6">
          <p className="text-gray-700 dark:text-gray-300">
            {t('reallyDeleteCurrentChat')}
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              {t('no')}
            </Button>
            <Button variant="primary" onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              {t('yes')}
            </Button>
          </div>
        </div>
      </Modal>

      <ExpertsOverlay
        isOpen={showExpertsOverlay}
        onClose={() => setShowExpertsOverlay(false)}
        experts={experts}
        selectedExpertId={chat.expertId}
        onSelectExpert={handleSelectExpert}
        onDeselectExpert={handleDeselectExpert}
        onEditExpert={handleEditExpert}
        onCreateExpert={handleCreateExpert}
      />

      <ExpertEditModal
        isOpen={showExpertEdit}
        onClose={() => setShowExpertEdit(false)}
        expert={editingExpert}
        onSave={handleSaveExpert}
        onCreate={handleCreateExpertSave}
        onDelete={onDeleteExpert}
        isCreating={isCreatingExpert}
      />

      <ExpertLimitOverlay
        isOpen={showExpertLimitOverlay}
        onClose={() => setShowExpertLimitOverlay(false)}
      />
    </>
  );
}
