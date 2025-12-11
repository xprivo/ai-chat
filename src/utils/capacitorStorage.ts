import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

// Capacitor-compatible storage wrapper
export const capacitorStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (isNative) {
        const { value } = await Preferences.get({ key });
        return value;
      } else {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isNative) {
        await Preferences.set({ key, value });
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (isNative) {
        await Preferences.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      if (isNative) {
        await Preferences.clear();
      } else {
        localStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  async keys(): Promise<string[]> {
    try {
      if (isNative) {
        const { keys } = await Preferences.keys();
        return keys;
      } else {
        return Object.keys(localStorage);
      }
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }
};

// Migration utility to move data from localStorage to Capacitor Preferences
export async function migrateToCapacitorStorage(): Promise<void> {
  if (!isNative) {
    return;
  }

  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) {
        await Preferences.set({ key, value });
      }
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Unified storage API that works with both localForage and Capacitor
export const unifiedStorage = {
  chats: {
    async get(): Promise<string | null> {
      return capacitorStorage.getItem('chats');
    },
    async set(value: string): Promise<void> {
      return capacitorStorage.setItem('chats', value);
    }
  },

  workspaces: {
    async get(): Promise<string | null> {
      return capacitorStorage.getItem('workspaces');
    },
    async set(value: string): Promise<void> {
      return capacitorStorage.setItem('workspaces', value);
    }
  },

  files: {
    async get(): Promise<string | null> {
      return capacitorStorage.getItem('files');
    },
    async set(value: string): Promise<void> {
      return capacitorStorage.setItem('files', value);
    }
  },

  settings: {
    async get(key: string): Promise<string | null> {
      return capacitorStorage.getItem(key);
    },
    async set(key: string, value: string): Promise<void> {
      return capacitorStorage.setItem(key, value);
    },
    async remove(key: string): Promise<void> {
      return capacitorStorage.removeItem(key);
    }
  }
};
