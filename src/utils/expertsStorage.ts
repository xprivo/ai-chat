import { Expert, Language } from '../types';
import { storage } from './storage';
import localforage from 'localforage';
import { Capacitor } from '@capacitor/core';
import { translations } from '../translations';


const isNative = Capacitor.isNativePlatform();

async function getTranslation(key: string, params?: Record<string, string | number>): Promise<string> {
  let language: Language = 'en';
  
  try {
    const stored = await storage.settings.get('language');
    if (stored) {
      language = stored as Language;
    }
  } catch (e) {
    // fallback to 'en'
  }
  
  let translation = translations[language]?.[key] || translations.en[key] || key;
  
  if (!params) {
    return translation;
  }
  
  return translation.replace(/{(\w+)}/g, (match, variableName) => {
    return params[variableName]?.toString() || match;
  });
}

export const expertStore = localforage.createInstance({
  name: 'xPrivo_Experts',
  storeName: 'experts'
});
 
export const AVAILABLE_EXPERT_ICONS = [
  'Brain',
  'Code',
  'Heart',
  'Calculator',
  'BookOpen',
  'Briefcase',
  'Lightbulb',
  'Shield',
  'Stethoscope',
  'GraduationCap',
  'PenTool',
  'Music',
  'Palette',
  'Globe',
  'Rocket',
  'Sparkles',
  'Target',
  'TrendingUp',
  'Leaf',
  'MessageCircle'
];


async function getDefaultExperts(): Promise<Omit<Expert, 'id' | 'createdAt'>[]> {
  return [
    {
      name: await getTranslation('role_psychologist_name'),
      description: await getTranslation('role_psychologist_desc'),
      instructions: await getTranslation('role_psychologist_instr'),
      icon: 'Heart'
    },
    {
      name: await getTranslation('role_food_analyst_name'),
      description: await getTranslation('role_food_analyst_desc'),
      instructions: await getTranslation('role_food_analyst_instr'),
      icon: 'Leaf'
    },
    {
      name: await getTranslation('role_travel_agent_name'),
      description: await getTranslation('role_travel_agent_desc'),
      instructions: await getTranslation('role_travel_agent_instr'),
      icon: 'Globe'
    },
    {
      name: await getTranslation('role_coding_expert_name'),
      description: await getTranslation('role_coding_expert_desc'),
      instructions: await getTranslation('role_coding_expert_instr'),
      icon: 'Code'
    }
];
}

export async function initializeExperts(): Promise<Expert[]> {
  try {
    const stored = await expertStore.getItem<string>('experts');
    if (stored) {
      const experts = JSON.parse(stored);
      return experts.map((expert: any) => ({
        ...expert,
        createdAt: new Date(expert.createdAt)
      }));
    }

    const defaultExpertsData = await getDefaultExperts();
    const defaultExperts: Expert[] = defaultExpertsData.map((expert, index) => ({
      ...expert,
      id: `expert_${Date.now()}_${index}`,
      createdAt: new Date()
    }));

    await expertStore.setItem('experts', JSON.stringify(defaultExperts));
    return defaultExperts;
  } catch (error) {
    console.error('Error initializing experts:', error);
    return [];
  }
}

export async function saveExperts(experts: Expert[]): Promise<void> {
  try {
    await expertStore.setItem('experts', JSON.stringify(experts));
  } catch (error) {
    console.error('Error saving experts:', error);
  }
}

export async function getExperts(): Promise<Expert[]> {
  try {
    const stored = await expertStore.getItem<string>('experts');
    if (stored) {
      const experts = JSON.parse(stored);
      return experts.map((expert: any) => ({
        ...expert,
        createdAt: new Date(expert.createdAt)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting experts:', error);
    return [];
  }
}

export function createExpert(data: Omit<Expert, 'id' | 'createdAt'>): Expert {
  return {
    ...data,
    id: `expert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date()
  };
}
 
export async function validateExpertLimits(name: string, description: string, instructions: string): Promise<{ valid: boolean; error?: string }> {
  if (name.length > 30) {
    return { valid: false, error: await getTranslation('expert_error_name_length', { max: 30 }) };
  }
  if (description.length > 60) {
    return { valid: false, error: await getTranslation('expert_error_description_length', { max: 60 }) };
  }
  if (instructions.length > 1500) {
    return { valid: false, error: await getTranslation('expert_error_instructions_length', { max: 1500 }) };
  }
  return { valid: true };
}
