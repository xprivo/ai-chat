export interface Shortcut {
  shortcut: string;
  nameKey: string;
  descriptionKey: string;
  categoryKey: string;
  icon: string;
  handler: (query: string) => ShortcutAction;
}

export interface ShortcutAction {
  type: 'widget' | 'ai' | 'search';
  widget?: 'calculator' | 'currency' | 'weather'; //'unit-converter'
  query?: string;
  aiMode?: boolean;
}

export const SHORTCUTS: Shortcut[] = [
  {
    shortcut: '/m',
    nameKey: 'shortcuts_info_weather_name',
    descriptionKey: 'shortcuts_info_weather_desc',
    categoryKey: 'shortcuts_info_category_widgets',
    icon: 'Sun',
    handler: (query: string) => ({
      type: 'search',
      query: query.trim(),
    }),
  },
  {
    shortcut: '/c',
    nameKey: 'shortcuts_info_calculator_name',
    descriptionKey: 'shortcuts_info_calculator_desc',
    categoryKey: 'shortcuts_info_category_widgets',
    icon: 'Calculator',
    handler: (query: string) => ({
      type: 'widget',
      widget: 'calculator',
      query: query.trim(),
    }),
  },
  /*{
    shortcut: '/u',
    nameKey: 'shortcuts_info_unit_name', // Make sure we add these to our JSON if uncommented
    descriptionKey: 'shortcuts_info_unit_desc',
    categoryKey: 'shortcuts_info_category_widgets',
    icon: 'Ruler',
    handler: (query: string) => ({
      type: 'widget',
      widget: 'unit-converter',
      query: query.trim(),
    }),
  },*/
  {
    shortcut: '/ai',
    nameKey: 'shortcuts_info_ai_name',
    descriptionKey: 'shortcuts_info_ai_desc',
    categoryKey: 'shortcuts_info_category_ai',
    icon: 'Sparkles',
    handler: (query: string) => ({
      type: 'ai',
      query: query.trim(),
      aiMode: true,
    }),
  },
];

export const POPULAR_SHORTCUTS = ['/ai', '/c', '/m']; //'/u'

function shortcutScore(shortcut: Shortcut, input: string, localizedName: string): number {
  const shortcutLower = shortcut.shortcut.toLowerCase();
  const nameLower = localizedName.toLowerCase();
  const inputLower = input.toLowerCase();

  if (shortcutLower === inputLower) return 1000;
  if (shortcutLower.startsWith(inputLower)) return 900 - shortcutLower.length;

  const inputNoPrefix = inputLower.startsWith('/') ? inputLower.slice(1) : inputLower;
  if (!inputNoPrefix) return 0;

  if (nameLower.startsWith(inputNoPrefix)) return 800 - nameLower.length;
  if (nameLower.includes(inputNoPrefix)) return 700 - nameLower.length;

  return -1;
}

export function getShortcutSuggestions(input: string, t: (key: string) => string, limit = 8): Shortcut[] {
  if (!input.startsWith('/')) return [];
  const inputLower = input.toLowerCase();
  if (inputLower.includes(' ')) return [];

  const isJustSlash = inputLower === '/';

  if (isJustSlash) {
    return POPULAR_SHORTCUTS
      .map(s => SHORTCUTS.find(x => x.shortcut === s))
      .filter((s): s is Shortcut => !!s)
      .slice(0, limit);
  }

  const scored: { shortcut: Shortcut; score: number }[] = [];

  for (const s of SHORTCUTS) {
    const localizedName = t(s.nameKey); 
    const score = shortcutScore(s, inputLower, localizedName);
    if (score > 0) scored.push({ shortcut: s, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(x => x.shortcut);
}

export function parseShortcutQuery(input: string): { shortcut: Shortcut; searchQuery: string } | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) return null;

  const spaceIdx = trimmed.indexOf(' ');
  if (spaceIdx === -1) return null;

  const shortcutStr = trimmed.slice(0, spaceIdx).toLowerCase();
  const searchQuery = trimmed.slice(spaceIdx + 1).trim();
  if (!searchQuery) return null;

  const shortcut = SHORTCUTS.find(s => s.shortcut === shortcutStr);
  if (!shortcut) return null;

  return { shortcut, searchQuery };
}