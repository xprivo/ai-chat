import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import Chat from './components/Chat/Chat';
import { EditWorkspaceModal } from './components/Sidebar/EditWorkspaceModal';
import { AddChatsModal } from './components/Sidebar/AddChatsModal';
import { RemoveChatsModal } from './components/Sidebar/RemoveChatsModal';
import { ConsentBanner } from './components/ConsentBanner/ConsentBanner';
import { ProOverlay } from './components/UI/ProOverlay';
import { useChats, useWorkspaces } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { useTranslation } from './hooks/useTranslation';
import { CSRFManager } from './utils/csrf';
import { Chat as ChatType, Workspace, Message, Expert } from './types';
import { initializeExperts, saveExperts, getExperts, createExpert } from './utils/expertsStorage';
import { storage } from './utils/storage';
import { getTonePreference } from './utils/toneStorage';
import { tones } from './components/UI/ToneSelectionOverlay';
 
function App() {
  const { chats, saveChats, isLoaded } = useChats();
  const { workspaces, saveWorkspaces } = useWorkspaces();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatTitles, setChatTitles] = useState<Record<string, string>>({});
  const [tempChat, setTempChat] = useState<ChatType | null>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedToneId, setSelectedToneId] = useState<string | null>(null);

  // Workspace editing modal states
  const [showEditWorkspaceModal, setShowEditWorkspaceModal] = useState(false);
  const [showAddChatsModal, setShowAddChatsModal] = useState(false);
  const [showRemoveChatsModal, setShowRemoveChatsModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [modalChats, setModalChats] = useState<ChatType[]>([]);
  const [showProOverlay, setShowProOverlay] = useState(false);

  const setCustomAssistantIcon = (imageUrl: string) => {
    localStorage.setItem('assistantIcon', imageUrl);
    window.dispatchEvent(new Event('storage'));
  };

  
  // Debug logging for chats
  useEffect(() => {
    const loadExperts = async () => {
      const loadedExperts = await initializeExperts();
      setExperts(loadedExperts);
    };
    loadExperts();
  }, []);

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

  useEffect(() => {
    /*console.log('App - chats state updated:', chats.length, chats);
    console.log('App - isLoaded:', isLoaded);*/
  }, [chats, isLoaded]);

  useEffect(() => {
    //console.log('Auto-create effect - isLoaded:', isLoaded, 'chats.length:', chats.length, 'selectedChatId:', selectedChatId);
    
    if (!isLoaded) {
      //console.log('Waiting for chats to load...');
      return;
    }

    if (selectedChatId === null && !tempChat) {
      handleNewChat();
    }
  }, [isLoaded, selectedChatId, tempChat]);

  // Initialize chat titles from chats
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
      
      const updatedChats = chats.map(chat => 
        chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat
      );
      
      const hasChanges = chats.some(chat => chat.id === chatId && chat.title !== title);
      if (hasChanges) {
        saveChats(updatedChats);
      }
      
      if (tempChat && tempChat.id === chatId) {
        setTempChat(prev => prev ? { ...prev, title, updatedAt: new Date() } : null);
      }
    };

    const handleChatTemperatureUpdate = (event: CustomEvent) => {
      const { chatId, temperature } = event.detail;

      const updatedChats = chats.map(chat => 
        chat.id === chatId ? { ...chat, temperature, updatedAt: new Date() } : chat
      );

      const hasChanges = chats.some(chat => chat.id === chatId && chat.temperature !== temperature);
      if (hasChanges) {
        saveChats(updatedChats);
      }
      
      if (tempChat && tempChat.id === chatId) {
        setTempChat(prev => prev ? { ...prev, temperature, updatedAt: new Date() } : null);
      }
    };

    const handleChatSystemPromptUpdate = (event: CustomEvent) => {
      const { chatId, systemPrompt } = event.detail;
      const updatedChats = chats.map(chat =>
        chat.id === chatId ? { ...chat, systemPrompt, updatedAt: new Date() } : chat
      );
      saveChats(updatedChats);
      if (tempChat && tempChat.id === chatId) {
        setTempChat(prev => (prev ? { ...prev, systemPrompt, updatedAt: new Date() } : null));
      }
    };

    window.addEventListener('chatTitleUpdated', handleChatTitleUpdate as EventListener);
    window.addEventListener('chatTemperatureUpdated', handleChatTemperatureUpdate as EventListener);
    window.addEventListener('chatSystemPromptUpdated', handleChatSystemPromptUpdate as EventListener);

    return () => {
      window.removeEventListener('chatTitleUpdated', handleChatTitleUpdate as EventListener);
      window.removeEventListener('chatTemperatureUpdated', handleChatTemperatureUpdate as EventListener);
      window.removeEventListener('chatSystemPromptUpdated', handleChatSystemPromptUpdate as EventListener);
    };
  }, [chats, tempChat, saveChats]);

  // Listen for workspace editing modal events
  useEffect(() => {
    const handleShowEditWorkspaceModal = (event: CustomEvent) => {
      setSelectedWorkspace(event.detail.workspace);
      setShowEditWorkspaceModal(true);
    };

    const handleShowAddChatsModal = (event: CustomEvent) => {
      setSelectedWorkspace(event.detail.workspace);
      setModalChats(event.detail.allChats);
      setShowAddChatsModal(true);
    };

    const handleShowRemoveChatsModal = (event: CustomEvent) => {
      setSelectedWorkspace(event.detail.workspace);
      setModalChats(event.detail.chats);
      setShowRemoveChatsModal(true);
    };

    window.addEventListener('showEditWorkspaceModal', handleShowEditWorkspaceModal as EventListener);
    window.addEventListener('showAddChatsModal', handleShowAddChatsModal as EventListener);
    window.addEventListener('showRemoveChatsModal', handleShowRemoveChatsModal as EventListener);

    return () => {
      window.removeEventListener('showEditWorkspaceModal', handleShowEditWorkspaceModal as EventListener);
      window.removeEventListener('showAddChatsModal', handleShowAddChatsModal as EventListener);
      window.removeEventListener('showRemoveChatsModal', handleShowRemoveChatsModal as EventListener);
    };
  }, []);

  useEffect(() => {
    // Initialize CSRF token on app start 
    const initializeCSRF = async () => {
      const csrfManager = CSRFManager.getInstance();
      await csrfManager.getValidToken();
    };
    
    initializeCSRF();

    setCustomAssistantIcon('/assets/logo/chatassistant.png'); // Can change the assistant icon here
    
    const applyTheme = () => {
      const root = document.documentElement;
      const isDark = theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      root.classList.remove('dark', 'light');
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyTheme();
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const selectedChat = chats.find(chat => chat.id === selectedChatId) || 
                      (tempChat && tempChat.id === selectedChatId ? tempChat : null);

  const handleNewChat = (workspaceId?: string, expertId?: string) => {
    const refreshCSRF = async () => {
      const csrfManager = CSRFManager.getInstance();
      await csrfManager.refreshToken();
    };
    
    refreshCSRF();
    
    const newTempChat: ChatType = {
      id: Date.now().toString(),
      title: t('newChat'),
      messages: [],
      workspaceId,
      expertId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Don't save to chats array yet, just set as temp chat
    setTempChat(newTempChat);
    setSelectedChatId(newTempChat.id);
    setIsSidebarOpen(false);
    
    // Update local titles
    setChatTitles(prev => ({
      ...prev,
      [newTempChat.id]: newTempChat.title
    }));
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setIsSidebarOpen(false);
  };

  const handleUpdateChat = (updatedChat: ChatType) => {
    // If this is a temp chat, update the temp chat state
    if (tempChat && tempChat.id === updatedChat.id) {
      setTempChat(updatedChat);
      // If it has messages, also save it to chats array
      if (updatedChat.messages.length > 0) {
        const updatedChats = [updatedChat, ...chats];
        setTempChat(null);
        saveChats(updatedChats);
      }
    } else {
      const updatedChats = chats.map(chat =>
        chat.id === updatedChat.id ? updatedChat : chat
      );
      saveChats(updatedChats);
    }

    setChatTitles(prev => ({
      ...prev,
      [updatedChat.id]: updatedChat.title
    }));

  };

  const handleDeleteChat = () => {
    if (!selectedChatId) return;
    
    // If deleting a temp chat, just clear it
    if (tempChat && tempChat.id === selectedChatId) {
      setTempChat(null);
    } else {
      const updatedChats = chats.filter(chat => chat.id !== selectedChatId);
      saveChats(updatedChats);
    }
    
    setSelectedChatId(null);
    
    setChatTitles(prev => {
      const newTitles = { ...prev };
      delete newTitles[selectedChatId];
      return newTitles;
    });
  };

  const handleDeleteAllChats = () => {
    saveChats([]);
    saveWorkspaces([]);
    setTempChat(null);
    setSelectedChatId(null);
    setChatTitles({});
    localStorage.removeItem('files');
  };

  const handleImportChats = (importedChats: ChatType[], importedWorkspaces: Workspace[], importedFiles: Record<string, string>, importedExperts: Expert[] = []) => {
    const saveImportedData = async () => {
      try {
        await storage.files.set(JSON.stringify(importedFiles));
      } catch (error) {
        console.error('Error saving imported files:', error);
      }
    };
    
    saveChats(importedChats);
    saveWorkspaces(importedWorkspaces);

    if (importedExperts.length > 0) {
      const existingExpertIds = new Set(experts.map(e => e.id));
      const newExperts = importedExperts.filter(e => !existingExpertIds.has(e.id));
      const mergedExperts = [...experts, ...newExperts].slice(0, 20);
      setExperts(mergedExperts);
      saveExperts(mergedExperts);
    }

    saveImportedData();
    
    const newTitles = Object.fromEntries(
      importedChats.map(chat => [chat.id, chat.title])
    );
    setChatTitles(prev => ({ ...newTitles, ...prev }));
    
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 10);
  };
  const handleCreateWorkspace = (workspaceData: Omit<Workspace, 'id' | 'createdAt'>) => {
    const newWorkspace: Workspace = {
      ...workspaceData,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    const updatedWorkspaces = [...workspaces, newWorkspace];
    saveWorkspaces(updatedWorkspaces);
  };

  const handleUpdateWorkspace = (updatedWorkspace: Workspace) => {
    const updatedWorkspaces = workspaces.map(workspace =>
      workspace.id === updatedWorkspace.id ? updatedWorkspace : workspace
    );
    saveWorkspaces(updatedWorkspaces);
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    // Remove the workspace
    const updatedWorkspaces = workspaces.filter(workspace => workspace.id !== workspaceId);
    
    const updatedChats = chats.map(chat => 
      chat.workspaceId === workspaceId 
        ? { ...chat, workspaceId: undefined, updatedAt: new Date() }
        : chat
    );
    
    saveWorkspaces(updatedWorkspaces);
    saveChats(updatedChats);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('workspaceDeleted', { 
        detail: { workspaceId }
      }));
      window.dispatchEvent(new Event('storage'));
    }, 10);
  };

  const handleNewChatInWorkspace = (workspaceId: string) => {
    handleNewChat(workspaceId);
  };

  const handleAddChatsToWorkspace = (workspaceId: string, chatIds: string[]) => {
    const updatedChats = chats.map(chat => 
      chatIds.includes(chat.id) ? { ...chat, workspaceId } : chat
    );
    saveChats(updatedChats);
  };

  const handleRemoveChatsFromWorkspace = (workspaceId: string, chatIds: string[]) => {
    const updatedChats = chats.map(chat => 
      chatIds.includes(chat.id) && chat.workspaceId === workspaceId 
        ? { ...chat, workspaceId: undefined } 
        : chat
    );
    saveChats(updatedChats);
  };

  const getWorkspaceInstructions = (workspaceId?: string): string | undefined => {
    if (!workspaceId) return undefined;
    return workspaces.find(w => w.id === workspaceId)?.instructions;
  };

  const getExpertInstructions = (expertId?: string): string | undefined => {
    if (!expertId) return undefined;
    return experts.find(e => e.id === expertId)?.instructions;
  };

  const getToneInstructions = (): string | undefined => {
    if (!selectedToneId) return undefined;
    const tone = tones.find(t => t.id === selectedToneId);
    return tone?.instruction || undefined;
  };

  const handleUpdateExperts = (updatedExperts: Expert[]) => {
    setExperts(updatedExperts);
    saveExperts(updatedExperts);
  };

  const handleDeleteExpert = (expertId: string) => {
    const updatedExperts = experts.filter(e => e.id !== expertId);
    setExperts(updatedExperts);
    saveExperts(updatedExperts);

    const updatedChats = chats.map(chat =>
      chat.expertId === expertId
        ? { ...chat, expertId: undefined, updatedAt: new Date() }
        : chat
    );
    saveChats(updatedChats);

    const updatedWorkspaces = workspaces.map(workspace =>
      workspace.expertId === expertId
        ? { ...workspace, expertId: undefined }
        : workspace
    );
    saveWorkspaces(updatedWorkspaces);

    if (tempChat && tempChat.expertId === expertId) {
      setTempChat(prev => prev ? { ...prev, expertId: undefined, updatedAt: new Date() } : null);
    }

    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 10);
  };

  const handleNewChatWithExpert = (expertId: string) => {
    handleNewChat(undefined, expertId);
  };

  const allChatsForSidebar = [...chats];
  
  if (tempChat && tempChat.messages.length > 0) {
    allChatsForSidebar.unshift(tempChat);
  }
  
  const chatsWithUpdatedTitles = allChatsForSidebar.map(chat => ({
    ...chat,
    title: chatTitles[chat.id] || chat.title
  }));

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={chatsWithUpdatedTitles}
        workspaces={workspaces}
        onNewChat={() => handleNewChat()}
        onSelectChat={handleSelectChat}
        onCreateWorkspace={handleCreateWorkspace}
        onNewChatInWorkspace={handleNewChatInWorkspace}
        onAddChatsToWorkspace={handleAddChatsToWorkspace}
        onRemoveChatsFromWorkspace={handleRemoveChatsFromWorkspace}
        onUpdateWorkspace={handleUpdateWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
        onDeleteAllChats={handleDeleteAllChats}
        onImportChats={handleImportChats}
        selectedChatId={selectedChatId}
        onShowProOverlay={() => setShowProOverlay(true)}
        experts={experts}
        onUpdateExperts={handleUpdateExperts}
        onDeleteExpert={handleDeleteExpert}
        onNewChatWithExpert={handleNewChatWithExpert}
      />

      <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
        {(selectedChat || tempChat) ? (
          <div className="w-full max-w-full overflow-hidden">
            <Chat
              chat={selectedChat || tempChat!}
              onUpdateChat={handleUpdateChat}
              onDeleteChat={handleDeleteChat}
              workspaceInstructions={getWorkspaceInstructions((selectedChat || tempChat)?.workspaceId)}
              expertInstructions={getExpertInstructions((selectedChat || tempChat)?.expertId)}
              toneInstructions={!getExpertInstructions((selectedChat || tempChat)?.expertId) ? getToneInstructions() : undefined}
              workspaces={workspaces}
              experts={experts}
              onUpdateExperts={handleUpdateExperts}
              onDeleteExpert={handleDeleteExpert}
              onShowProOverlay={() => setShowProOverlay(true)}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('welcomeMessage')}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 px-4">
                {t('welcomeSubtitle')}
              </p>
              <button
                onClick={() => handleNewChat()}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                {t('startNewChat')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Workspace Editing Modal*/}
      <EditWorkspaceModal
        isOpen={showEditWorkspaceModal}
        workspace={selectedWorkspace}
        onClose={() => {
          setShowEditWorkspaceModal(false);
          setSelectedWorkspace(null);
        }}
        onUpdateWorkspace={handleUpdateWorkspace}
      />

      <AddChatsModal
        isOpen={showAddChatsModal}
        workspace={selectedWorkspace}
        allChats={modalChats}
        onClose={() => {
          setShowAddChatsModal(false);
          setSelectedWorkspace(null);
          setModalChats([]);
        }}
        onAddChatsToWorkspace={handleAddChatsToWorkspace}
      />

      <RemoveChatsModal
        isOpen={showRemoveChatsModal}
        workspace={selectedWorkspace}
        chats={modalChats}
        onClose={() => {
          setShowRemoveChatsModal(false);
          setSelectedWorkspace(null);
          setModalChats([]);
        }}
        onRemoveChatsFromWorkspace={handleRemoveChatsFromWorkspace}
      />

      <ConsentBanner />
      
      <ProOverlay
        isOpen={showProOverlay}
        onClose={() => setShowProOverlay(false)}
      />
    </div>
  );
}

export default App;