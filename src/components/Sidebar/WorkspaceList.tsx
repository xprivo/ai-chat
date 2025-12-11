import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Pin, PinOff } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Workspace, Chat } from '../../types';
import { WorkspaceManager } from './WorkspaceManager';
import { Portal } from '../UI/Portal';
 
interface WorkspaceListProps {
  workspaces: Workspace[];
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
  onNewChatInWorkspace: (workspaceId: string) => void;
  onAddChatsToWorkspace: (workspaceId: string, chatIds: string[]) => void;
  onRemoveChatsFromWorkspace: (workspaceId: string, chatIds: string[]) => void;
  onUpdateWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: (workspaceId: string) => void;
  selectedChatId?: string;
}

export function WorkspaceList({ 
  workspaces, 
  chats, 
  onSelectChat,
  onNewChatInWorkspace,
  onAddChatsToWorkspace,
  onRemoveChatsFromWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
  selectedChatId 
}: WorkspaceListProps) {
  const { t } = useTranslation();
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [showAllWorkspaces, setShowAllWorkspaces] = useState(false);
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

  const toggleWorkspace = (workspaceId: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId);
    } else {
      newExpanded.add(workspaceId);
    }
    setExpandedWorkspaces(newExpanded);
  };

  const openWorkspace = (workspaceId: string) => {
    setSelectedWorkspace(workspaceId);
  };

  const backToWorkspaces = () => {
    setSelectedWorkspace(null);
  };

  const getWorkspaceChats = (workspaceId: string) => {
    return chats.filter(chat => chat.workspaceId === workspaceId);
  };

  const handleTogglePin = (workspace: Workspace, e: React.MouseEvent) => {
    e.stopPropagation();
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

  if (workspaces.length === 0) {
    return (
      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
        {t('noWorkspacesYet')}
      </div>
    );
  }

  // Separate pinned and unpinned workspaces
  const pinnedWorkspaces = workspaces.filter(w => w.isPinned);
  const unpinnedWorkspaces = workspaces.filter(w => !w.isPinned);
  
  // Show first 5 unpinned workspaces in sidebar
  const visibleUnpinnedWorkspaces = unpinnedWorkspaces.slice(0, 5);
  const hasMoreWorkspaces = unpinnedWorkspaces.length > 5;

  if (selectedWorkspace) {
    const workspace = workspaces.find(w => w.id === selectedWorkspace);
    const workspaceChats = getWorkspaceChats(selectedWorkspace);

    if (!workspace) return null;

    return (
      <WorkspaceManager
        workspace={workspace}
        chats={workspaceChats}
        allChats={chats}
        onSelectChat={onSelectChat}
        onNewChatInWorkspace={onNewChatInWorkspace}
        onAddChatsToWorkspace={onAddChatsToWorkspace}
        onRemoveChatsFromWorkspace={onRemoveChatsFromWorkspace}
        onUpdateWorkspace={onUpdateWorkspace}
        onDeleteWorkspace={onDeleteWorkspace}
        onBack={backToWorkspaces}
        selectedChatId={selectedChatId}
      />
    );
  }

  const renderWorkspace = (workspace: Workspace) => {
    const workspaceChats = getWorkspaceChats(workspace.id);
    const isExpanded = expandedWorkspaces.has(workspace.id);
    const hasChats = workspaceChats.length > 0;

    return (
      <div key={workspace.id} className="mb-2">
        <div className="flex items-center group/workspace">
          {hasChats && (
            <button
              onClick={() => toggleWorkspace(workspace.id)}
              className="flex items-center justify-center p-3 sm:p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg min-w-[44px] sm:min-w-[36px]"
              aria-label={isExpanded ? 'Collapse workspace' : 'Expand workspace'}
            >
              {isExpanded ? <ChevronDown size={20} className="sm:w-4 sm:h-4" /> : <ChevronRight size={20} className="sm:w-4 sm:h-4" />}
            </button>
          )}
          <button
            onClick={() => openWorkspace(workspace.id)}
            className="flex-1 text-left px-2 py-2.5 sm:py-2 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors truncate rounded-lg"
          >
            {workspace.isPinned && <Pin size={14} className="inline mr-1.5 text-blue-500" />}
            {workspace.name}
            {hasChats && (
              <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">({workspaceChats.length})</span>
            )}
          </button>
        </div>

        {isExpanded && hasChats && (
          <div className="ml-6 mt-1 space-y-1">
            {workspaceChats.slice(0, 3).map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left px-2 py-2.5 sm:py-2 rounded-lg text-sm truncate transition-colors ${
                  selectedChatId === chat.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {chatTitles[chat.id] || chat.title}
              </button>
            ))}
            {workspaceChats.length > 3 && (
              <button
                onClick={() => openWorkspace(workspace.id)}
                className="w-full text-left px-2 py-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
               {t('common_plusXMore', { count: workspaceChats.length - 3 })}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="px-3 sm:px-4">
        {/* Pinned Workspaces */}
        {pinnedWorkspaces.length > 0 && (
          <div className="mb-4">
            <h4 className="px-1 mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('pinnedWorkspaces')}
            </h4>
            <div>
              {pinnedWorkspaces.map(renderWorkspace)}
            </div>
          </div>
        )}

        {/* Regular Workspaces */}
        {visibleUnpinnedWorkspaces.length > 0 && (
          <div>
            {pinnedWorkspaces.length > 0 && (
              <h4 className="px-1 mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('workspaces')}
              </h4>
            )}
            {visibleUnpinnedWorkspaces.map(renderWorkspace)}
          </div>
        )}

        {hasMoreWorkspaces && (
          <button
            onClick={() => setShowAllWorkspaces(true)}
            className="w-full text-left px-2 py-2.5 sm:py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
           {t('showAll')} {t('common_xMore_parentheses', { count: unpinnedWorkspaces.length - 5 })}
          </button>
        )}
      </div>

      {showAllWorkspaces && (
        <Portal>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4"
            onClick={() => setShowAllWorkspaces(false)}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[800px] max-w-[90vw] max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('allWorkspaces')}</h2>
                <button
                  onClick={() => setShowAllWorkspaces(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-auto max-h-[60vh]">
                {/* Pinned Workspaces Section */}
                {pinnedWorkspaces.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      {t('pinnedWorkspaces')}
                    </h3>
                    <div className="space-y-2">
                      {pinnedWorkspaces.map((workspace) => (
                        <div key={workspace.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group">
                          <button
                            onClick={() => {
                              openWorkspace(workspace.id);
                              setShowAllWorkspaces(false);
                            }}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <Pin size={14} className="text-blue-500" />
                              <span className="font-medium text-gray-900 dark:text-white">{workspace.name}</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {t('workspace_chatCount', { count: getWorkspaceChats(workspace.id).length })}
                            </div>
                          </button>
                          <button
                            onClick={(e) => handleTogglePin(workspace, e)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            title={t('unpinWorkspace')}
                          >
                            <PinOff size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Workspaces Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {pinnedWorkspaces.length > 0 ? t('workspaces') : t('allWorkspaces')}
                  </h3>
                  <div className="space-y-2">
                    {unpinnedWorkspaces.map((workspace) => (
                      <div key={workspace.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <button
                          onClick={() => {
                            openWorkspace(workspace.id);
                            setShowAllWorkspaces(false);
                          }}
                          className="flex-1 text-left"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{workspace.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                           {t('workspace_chatCount', { count: getWorkspaceChats(workspace.id).length })}
                          </div>
                        </button>
                        <button
                          onClick={(e) => handleTogglePin(workspace, e)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={t('pinWorkspace')}
                        >
                          <Pin size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}