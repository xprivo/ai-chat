import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export interface CapacitorFile {
  name: string;
  data: string;
  mimeType: string;
}

export const capacitorFiles = {
  async readFile(path: string): Promise<string | null> {
    if (!isNative) {
      return null;
    }

    try {
      const result = await Filesystem.readFile({
        path,
        directory: Directory.Data
      });
      return result.data as string;
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  },

  async writeFile(path: string, data: string): Promise<boolean> {
    if (!isNative) {
      return false;
    }

    try {
      await Filesystem.writeFile({
        path,
        data,
        directory: Directory.Data,
        recursive: true
      });
      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      return false;
    }
  },

  async deleteFile(path: string): Promise<boolean> {
    if (!isNative) {
      return false;
    }

    try {
      await Filesystem.deleteFile({
        path,
        directory: Directory.Data
      });
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  },

  async listFiles(path: string = ''): Promise<string[]> {
    if (!isNative) {
      return [];
    }

    try {
      const result = await Filesystem.readdir({
        path,
        directory: Directory.Data
      });
      return result.files.map(f => f.name || '');
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  },

  async createDirectory(path: string): Promise<boolean> {
    if (!isNative) {
      return false;
    }

    try {
      await Filesystem.mkdir({
        path,
        directory: Directory.Data,
        recursive: true
      });
      return true;
    } catch (error) {
      console.error('Error creating directory:', error);
      return false;
    }
  },

  async getUri(path: string): Promise<string | null> {
    if (!isNative) {
      return null;
    }

    try {
      const result = await Filesystem.getUri({
        path,
        directory: Directory.Data
      });
      return result.uri;
    } catch (error) {
      console.error('Error getting URI:', error);
      return null;
    }
  }
};

export async function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function isCapacitorNative(): boolean {
  return isNative;
}
