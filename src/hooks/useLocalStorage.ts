import { useState, useEffect } from 'react';
import { Chat, Workspace, AISettings } from '../types';
import { storage, migrateFromLocalStorage } from '../utils/storage';
 
export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadChats = async () => {

      // Run migration first
      await migrateFromLocalStorage();
      
      try {
        const stored = await storage.chats.get();
        
        if (stored) {
          const parsed = JSON.parse(stored);
          const loadedChats = parsed.map((chat: any) => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt),
            messages: chat.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setChats(loadedChats);
        } else {
          setChats([]);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        setChats([]);
      } finally {
        setIsLoaded(true);
      }
    };

    loadChats();
  }, []);

  const saveChats = async (newChats: Chat[]) => {
    setChats(newChats);
    
    try {
      const serialized = JSON.stringify(newChats);
      await storage.chats.set(serialized);
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  };

  return { chats, saveChats, isLoaded };
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const stored = await storage.workspaces.get();
        if (stored) {
          const parsed = JSON.parse(stored);
          setWorkspaces(parsed.map((workspace: any) => ({
            ...workspace,
            createdAt: new Date(workspace.createdAt)
          })));
        }
      } catch (error) {
        console.error('Error loading workspaces:', error);
      }
    };

    loadWorkspaces();
  }, []);

  const saveWorkspaces = async (newWorkspaces: Workspace[]) => {
    setWorkspaces(newWorkspaces);
    try {
      await storage.workspaces.set(JSON.stringify(newWorkspaces));
    } catch (error) {
      console.error('Error saving workspaces:', error);
    }
  };

  return { workspaces, saveWorkspaces };
}

export function useFiles() {
  const [files, setFiles] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const stored = await storage.files.get();
        if (stored) {
          const parsed = JSON.parse(stored);
          setFiles(parsed);
        }
      } catch (error) {
        console.error('Error loading files:', error);
      }
    };

    const handleFilesUpdate = (event: CustomEvent) => {
      if (event.detail.files) {
        setFiles(event.detail.files);
      }
    };

    window.addEventListener('filesUpdated', handleFilesUpdate as EventListener);
    loadFiles();

    return () => {
      window.removeEventListener('filesUpdated', handleFilesUpdate as EventListener);
    };
  }, []);

  const saveFile = async (id: string, content: string) => {
    const newFiles = { ...files, [id]: content };
    setFiles(newFiles);
    
    try {
      await storage.files.set(JSON.stringify(newFiles));
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const getFile = (id: string) => {
    return files[id];
  };

  const deleteFile = async (id: string) => {
    const newFiles = { ...files };
    delete newFiles[id];
    setFiles(newFiles);
    
    try {
      await storage.files.set(JSON.stringify(newFiles));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return { files, saveFile, getFile, deleteFile };
}

export function useAISettings() {
  const [aiSettings, setAISettings] = useState<AISettings>(() => {
    // Default settings - will be overridden by async load
    return {
      endpoints: [
        {
          id: 'default',
          name: 'xPrivo',
          url: 'https://www.xprivo.com/v1/chat/completions',
          authorization: 'Bearer API_KEY_XPRIVO',
          models: ['xprivo'],
          enableWebSearch: false, 
          enableSafeWebSearch: true // Safe web search enabled by default 
        }
      ],
      selectedModel: 'xprivo'
    };
  });

  useEffect(() => {
    const loadAISettings = async () => {
      try {
        const stored = await storage.settings.get('aiSettings');
        if (stored) {
          const parsed = JSON.parse(stored);
          setAISettings(parsed);
        }
      } catch (error) {
        console.error('Error loading AI settings:', error);
      }
    };

    const handleAISettingsUpdate = (event: CustomEvent) => {
      setAISettings(event.detail.settings);
    };

    window.addEventListener('aiSettingsUpdated', handleAISettingsUpdate as EventListener);
    loadAISettings();

    return () => {
      window.removeEventListener('aiSettingsUpdated', handleAISettingsUpdate as EventListener);
    };
  }, []);

  const saveAISettings = async (newSettings: AISettings) => {
    setAISettings(newSettings);
    
    try {
      await storage.settings.set('aiSettings', JSON.stringify(newSettings));

      window.dispatchEvent(new CustomEvent('aiSettingsUpdated', { 
        detail: { settings: newSettings }
      }));
    } catch (error) {
      console.error('Error saving AI settings:', error);
    }
  };

  return { aiSettings, saveAISettings };
}

export function useDateSetting() {
  const [useCurrentDate, setUseCurrentDate] = useState(true); // Default to true

  useEffect(() => {
    const loadDateSetting = async () => {
      try {
        const stored = await storage.settings.get('useCurrentDate');
        if (stored !== null) {
          setUseCurrentDate(stored !== 'false');
        }
      } catch (error) {
        console.error('Error loading date setting:', error);
      }
    };

    const handleDateSettingUpdate = (event: CustomEvent) => {
      if (typeof event.detail.enabled === 'boolean') {
        setUseCurrentDate(event.detail.enabled);
      }
    };

    window.addEventListener('dateSettingChanged', handleDateSettingUpdate as EventListener);
    loadDateSetting();

    return () => {
      window.removeEventListener('dateSettingChanged', handleDateSettingUpdate as EventListener);
    };
  }, []);

  const saveDateSetting = async (enabled: boolean) => {
    setUseCurrentDate(enabled);
    try {
      await storage.settings.set('useCurrentDate', enabled.toString());
      window.dispatchEvent(new CustomEvent('dateSettingChanged', { 
        detail: { enabled }
      }));
    } catch (error) {
      console.error('Error saving date setting:', error);
    }
  };

  return { useCurrentDate, saveDateSetting };
}