import localforage from 'localforage';
import { Capacitor } from '@capacitor/core';
import { capacitorStorage, unifiedStorage } from './capacitorStorage';

const isNative = Capacitor.isNativePlatform();

// Configure localForage
localforage.config({
  name: 'xPrivo',
  version: 1.0,
  size: 4980736, // Size of the database
  storeName: 'xprivo_ai_store',
  description: 'xPrivo local storage for chats, workspaces, and files'
});


export const chatStore = localforage.createInstance({
  name: 'xPrivo_Chats',
  storeName: 'chats'
});

export const workspaceStore = localforage.createInstance({
  name: 'xPrivo_Workspaces', 
  storeName: 'workspaces'
});

export const fileStore = localforage.createInstance({
  name: 'xPrivo_Files',
  storeName: 'files'
});

export const settingsStore = localforage.createInstance({
  name: 'xPrivo_Settings',
  storeName: 'settings'
});

// Migration utility to move data from localStorage to localForage
export async function migrateFromLocalStorage(): Promise<void> {
  try {
    // Migrate chats
    const chatsData = localStorage.getItem('chats');
    if (chatsData && !(await chatStore.getItem('chats'))) {
      await chatStore.setItem('chats', chatsData);
    }
    
    // Migrate workspaces
    const workspacesData = localStorage.getItem('workspaces');
    if (workspacesData && !(await workspaceStore.getItem('workspaces'))) {
      await workspaceStore.setItem('workspaces', workspacesData);
    }
    
    // Migrate files
    const filesData = localStorage.getItem('files');
    if (filesData && !(await fileStore.getItem('files'))) {
      await fileStore.setItem('files', filesData);
    }
    
    // Migrate AI settings
    const aiSettingsData = localStorage.getItem('aiSettings');
    if (aiSettingsData && !(await settingsStore.getItem('aiSettings'))) {
      await settingsStore.setItem('aiSettings', aiSettingsData);
    }
    
    // Migrate other settings
    const settingsToMigrate = [
      'theme', 'language', 'useCurrentDate', 'requestType', 
      'safeWebSearchActive', 'userConsent', 'hideInfoBoxes', 'accountStatus'
    ];
    
    for (const key of settingsToMigrate) {
      const value = localStorage.getItem(key);
      if (value && !(await settingsStore.getItem(key))) {
        await settingsStore.setItem(key, value);
      }
    }
  } catch (error) {
    console.error('Migration failed');
  }
}

// Storage utilities with async/await support
// Use Capacitor storage on native platforms, localForage on web
export const storage = isNative ? unifiedStorage : {
  // Generic get/set for any store
  async getItem(store: LocalForage, key: string): Promise<string | null> {
    try {
      return await store.getItem(key);
    } catch (error) {
      console.error('Error getting key');
      return null;
    }
  },

  async setItem(store: LocalForage, key: string, value: string): Promise<void> {
    try {
      await store.setItem(key, value);
    } catch (error) {
      console.error('Error setting key');
    }
  },

  async removeItem(store: LocalForage, key: string): Promise<void> {
    try {
      await store.removeItem(key);
    } catch (error) {
      console.error('Error removing key');
    }
  },

  // Convenience methods for specific stores
  chats: {
    async get(): Promise<string | null> {
      return storage.getItem(chatStore, 'chats');
    },
    async set(value: string): Promise<void> {
      return storage.setItem(chatStore, 'chats', value);
    }
  },

  workspaces: {
    async get(): Promise<string | null> {
      return storage.getItem(workspaceStore, 'workspaces');
    },
    async set(value: string): Promise<void> {
      return storage.setItem(workspaceStore, 'workspaces', value);
    }
  },

  files: {
    async get(): Promise<string | null> {
      return storage.getItem(fileStore, 'files');
    },
    async set(value: string): Promise<void> {
      return storage.setItem(fileStore, 'files', value);
    }
  },

  settings: {
    async get(key: string): Promise<string | null> {
      return storage.getItem(settingsStore, key);
    },
    async set(key: string, value: string): Promise<void> {
      return storage.setItem(settingsStore, key, value);
    },
    async remove(key: string): Promise<void> {
      return storage.removeItem(settingsStore, key);
    }
  }
};