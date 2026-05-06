// Chat backup and restore utilities

import { Chat, Workspace, Expert } from '../types';
import { storage } from './storage';
import { downloadFile } from './downloadHelper';

export interface ChatBackup {
  version: '1.0';
  timestamp: string;
  type: 'full_backup' | 'single_chat';
  data: {
    chats: Chat[];
    workspaces: Workspace[];
    files: Record<string, string>;
    experts?: Expert[];
  };
}

export async function exportChatsToFile(chats: Chat[], workspaces: Workspace[], files: Record<string, string>, experts: Expert[] = [], type: 'full_backup' | 'single_chat' = 'full_backup'): Promise<void> {
  const backup: ChatBackup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    type,
    data: {
      chats,
      workspaces,
      files,
      experts
    }
  };

  const dataStr = JSON.stringify(backup, null, 2);

  let filename: string;
  if (type === 'single_chat' && chats.length === 1) {
    const chatTitle = chats[0].title.replace(/[^a-zA-Z0-9]/g, '_');
    filename = `xprivo_ai_chat_${chatTitle}_${new Date().toISOString().split('T')[0]}.txt`;
  } else {
    filename = `xprivo_ai_backup_${new Date().toISOString().split('T')[0]}.txt`;
  }

  await downloadFile(dataStr, filename, 'text/plain');
}

export async function exportSingleChat(chat: Chat, workspaces: Workspace[], files: Record<string, string>, experts: Expert[] = []): Promise<void> {
  // Get only files related to this chat
  const chatFiles = Object.fromEntries(
    Object.entries(files).filter(([key]) => key.startsWith(`${chat.id}_`))
  );

  // Get workspace if chat belongs to one
  const chatWorkspace = chat.workspaceId ? workspaces.find(w => w.id === chat.workspaceId) : undefined;
  const chatWorkspaces = chatWorkspace ? [chatWorkspace] : [];

  await exportChatsToFile([chat], chatWorkspaces, chatFiles, experts, 'single_chat');
}

export async function downloadSingleKey(key: string): Promise<void> {
  await downloadFile(key, 'xprivo_pro_key.txt', 'text/plain', 'key');
}

export async function importChatsFromFile(file: File): Promise<{
  chats: Chat[];
  workspaces: Workspace[];
  files: Record<string, string>;
  experts: Expert[];
  isValid: boolean;
  error?: string;
}> {
  try {
    // Validate file type
    if (!file.name.endsWith('.txt')) {
      return {
        chats: [],
        workspaces: [],
        files: {},
        experts: [],
        isValid: false,
       error: t('import_error_selectTxtFile')
      };
    }

    const content = await file.text();
    const backup: ChatBackup = JSON.parse(content);

    // Validate backup structure
    if (!backup.version || !backup.data || !Array.isArray(backup.data.chats)) {
      return {
        chats: [],
        workspaces: [],
        files: {},
        experts: [],
        isValid: false,
        error: t('import_error_invalidFormat')
      };
    }

    // Convert date strings back to Date objects
    const chats = backup.data.chats.map(chat => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      messages: chat.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));

    const workspaces = (backup.data.workspaces || []).map(workspace => ({
      ...workspace,
      createdAt: new Date(workspace.createdAt)
    }));

    const experts = (backup.data.experts || []).map(expert => ({
      ...expert,
      createdAt: new Date(expert.createdAt)
    }));

    return {
      chats,
      workspaces,
      files: backup.data.files || {},
      experts,
      isValid: true
    };
  } catch (error) {
    console.error('Import error:', error);
    return {
      chats: [],
      workspaces: [],
      files: {},
      experts: [],
      isValid: false,
      error: t('import_error_parseFailed')
    };
  }
}

export function mergeImportedData(
  existingChats: Chat[],
  existingWorkspaces: Workspace[],
  existingFiles: Record<string, string>,
  existingExperts: Expert[],
  importedChats: Chat[],
  importedWorkspaces: Workspace[],
  importedFiles: Record<string, string>,
  importedExperts: Expert[]
): {
  mergedChats: Chat[];
  mergedWorkspaces: Workspace[];
  mergedFiles: Record<string, string>;
  mergedExperts: Expert[];
  stats: {
    chatsAdded: number;
    workspacesAdded: number;
    filesAdded: number;
    expertsAdded: number;
  };
} {
  const existingChatIds = new Set(existingChats.map(c => c.id));
  const existingWorkspaceIds = new Set(existingWorkspaces.map(w => w.id));
  const existingFileKeys = new Set(Object.keys(existingFiles));
  const existingExpertIds = new Set(existingExperts.map(e => e.id));

  const newChats = importedChats.filter(chat => !existingChatIds.has(chat.id));
  const newWorkspaces = importedWorkspaces.filter(workspace => !existingWorkspaceIds.has(workspace.id));
  const newFiles = Object.fromEntries(
    Object.entries(importedFiles).filter(([key]) => !existingFileKeys.has(key))
  );
  const newExperts = importedExperts.filter(expert => !existingExpertIds.has(expert.id));

  return {
    mergedChats: [...newChats, ...existingChats],
    mergedWorkspaces: [...existingWorkspaces, ...newWorkspaces],
    mergedFiles: { ...existingFiles, ...newFiles },
    mergedExperts: [...existingExperts, ...newExperts],
    stats: {
      chatsAdded: newChats.length,
      workspacesAdded: newWorkspaces.length,
      filesAdded: Object.keys(newFiles).length,
      expertsAdded: newExperts.length
    }
  };
}