import React, { useState, useEffect } from 'react';
import { Download, Check } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useWorkspaces, useFiles } from '../../hooks/useLocalStorage';
import { exportSingleChat } from '../../utils/chatBackup';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { Chat } from '../../types';
import { Textarea } from '../UI/Textarea';

interface ChatSettingsProps {
  chat: Chat;
  temperature: number;
  onUpdateChatTitle: (title: string) => void;
  onUpdateTemperature: (temperature: number) => void;
  onUpdateSystemPrompt: (systemPrompt: string) => void;
  onClose: () => void;
}

export function ChatSettings({ 
  chat,
  temperature,
  onUpdateChatTitle, 
  onUpdateTemperature,
  onUpdateSystemPrompt,
  onClose 
}: ChatSettingsProps) {
  const { t } = useTranslation();
  const { workspaces } = useWorkspaces();
  const { files } = useFiles();
  const [title, setTitle] = useState(chat.title);
  const [temp, setTemp] = useState(temperature);
  const [systemPrompt, setSystemPrompt] = useState(chat.systemPrompt || '');
  
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setTitle(chat.title);
    setTemp(temperature);
    setSystemPrompt(chat.systemPrompt || '');
  }, [chat.title, temperature, chat.systemPrompt]);

  const handleDownloadChat = async () => {
    try {
      await exportSingleChat(chat, workspaces, files);
    } catch (error) {
      console.error('Error downloading chat:', error);
    }
  };

  const hasMessages = chat.messages.length > 0;

  const handleSave = () => {
    if (title.trim() !== chat.title) {
      onUpdateChatTitle(title.trim());
    }
    
    if (temp !== temperature) {
      onUpdateTemperature(temp);
    }

    if (systemPrompt.trim() !== (chat.systemPrompt || '')) {
      onUpdateSystemPrompt(systemPrompt.trim());
    }
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  const handleCancel = () => {
    setTitle(chat.title);
    setTemp(temperature);
    setSystemPrompt(chat.systemPrompt || '');
    onClose();
  };

  return (
    <div className="flex flex-col w-full overflow-hidden h-[600px] max-h-[calc(100dvh-10rem)] sm:max-h-[calc(100dvh-12rem)]">
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 custom-scrollbar"> 
        <div className="space-y-6">
          
          <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('exportChat')}
            </label>
            <Button
              onClick={handleDownloadChat}
              disabled={!hasMessages}
              variant="outline"
              className="inline-flex items-center px-4 py-2"
            >
              <Download size={16} className="mr-2" />
              {t('downloadChat')}
            </Button>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {hasMessages ? t('exportChatDescription') : t('addMessagesToEnableExport')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('chatTitle')}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('enterChatTitle')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('temperature')}
            </label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('temperatureDescription')}
            </p>
          </div>

          <div className="pb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('systemPrompt')}
            </label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={t('enterSystemPrompt')}
              rows={4}
              className="resize-none min-h-[100px]"
            />
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-xs text-gray-600 dark:text-gray-400">
              {t('systemPromptInfo')}
            </div>
          </div>
          
        </div>
      </div>

      <div className="flex-none p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-end gap-3">
           {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mr-auto">
              <Check size={16} />
              <span className="text-sm font-medium">{t('successfullySaved')}</span>
            </div>
          )}
          <Button variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('save')}
          </Button>
        </div>
      </div>
      
    </div>
  );
}