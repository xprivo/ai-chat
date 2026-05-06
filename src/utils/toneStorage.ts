import localforage from 'localforage';
import { storage } from './storage';

export const toneStore = localforage.createInstance({
  name: 'xPrivo_Tone',
  storeName: 'tone'
});

export interface TonePreference {
  selectedToneId: string | null;
}

export async function getTonePreference(): Promise<string | null> {
  try {
    const stored = await storage.settings.get('selectedTone');
    return stored;
  } catch (error) {
    console.error('Error getting tone preference:', error);
    return null;
  }
}

export async function saveTonePreference(toneId: string | null): Promise<void> {
  try {
    if (toneId) {
      await storage.settings.set('selectedTone', toneId);
    } else {
      await storage.settings.remove('selectedTone');
    }
    // Mark notification as unread whenever tone changes
    await storage.settings.set('toneNotificationRead', 'false');
  } catch (error) {
    console.error('Error saving tone preference:', error);
  }
}

export async function clearTonePreference(): Promise<void> {
  try {
    await storage.settings.remove('selectedTone');
  } catch (error) {
    console.error('Error clearing tone preference:', error);
  }
}

export async function getToneNotificationRead(): Promise<boolean> {
  try {
    const val = await storage.settings.get('toneNotificationRead');
    return val === 'true';
  } catch {
    return false;
  }
}

export async function setToneNotificationRead(read: boolean): Promise<void> {
  try {
    await storage.settings.set('toneNotificationRead', read ? 'true' : 'false');
  } catch (error) {
    console.error('Error saving tone notification read state:', error);
  }
}
