import { SETUP_CONFIG } from '../config/setup';

export interface ExtraModelData {
  name: string;
  ispremium: boolean;
  logo_url: string;
  reasoning: boolean;
}

export interface ImportantNotification {
  notification_version: number;
  title: string;
  subtitle?: string;
  button_text?: string;
  button_link?: string;
}

export interface ProModelsResponse {
  extra_models: Record<string, ExtraModelData>;
  important_notification?: ImportantNotification;
}

let _cachedPromise: Promise<ProModelsResponse | null> | null = null;

export async function fetchProModels(lang?: string): Promise<ProModelsResponse | null> {
  if (!SETUP_CONFIG.get_pro_models) {
    return null;
  }

  if (_cachedPromise) {
    return _cachedPromise;
  }

  _cachedPromise = (async () => {
    try {
      const params = new URLSearchParams();
      params.set('appversion', SETUP_CONFIG.appVersion);
      if (lang) {
        params.set('lang', lang);
      }

      const response = await fetch(`https://www.xprivo.com/auth/pro-models?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch PRO models');
        _cachedPromise = null;
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching PRO models');
      _cachedPromise = null;
      return null;
    }
  })();

  return _cachedPromise;
}
