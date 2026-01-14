import { SETUP_CONFIG } from '../config/setup';

export interface ExtraModelData {
  name: string;
  ispremium: boolean;
  logo_url: string;
  reasoning: boolean;
}

export interface ProModelsResponse {
  extra_models: Record<string, ExtraModelData>;
}

export async function fetchProModels(): Promise<ProModelsResponse | null> {
  if (!SETUP_CONFIG.get_pro_models) {
    return null;
  }

  try {
    const response = await fetch('https://www.xprivo.com/auth/pro-models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch PRO models');
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching PRO models');
    return null;
  }
}
