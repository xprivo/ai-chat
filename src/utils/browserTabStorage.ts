import { capacitorStorage } from './capacitorStorage';

export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  description: string;
  favicon_url: string;
  image_url?: string;
  created_at?: number;
  position?: number;
}

const STORAGE_KEY = 'browser_tabs';
const BOOKMARKS_KEY = 'browser_bookmarks';
const ACTIVE_TAB_KEY = 'browser_active_tab';

function sanitizeTab(tab: BrowserTab): BrowserTab {
  return {
    ...tab,
    title: (tab.title || '').substring(0, 150),
    description: (tab.description || '').substring(0, 300),
    favicon_url: tab.favicon_url?.startsWith('data:') ? '' : (tab.favicon_url || ''),
    image_url: tab.image_url?.startsWith('data:') ? '' : (tab.image_url || ''),

    position: typeof tab.position === 'number' ? tab.position : 0,
    created_at: tab.created_at || Date.now(),
  };
}

export async function getBrowserTabs(): Promise<BrowserTab[]> {
  const raw = await capacitorStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export async function saveBrowserTabs(tabs: BrowserTab[]): Promise<void> {
  const safeTabs = tabs.map(sanitizeTab);
  try { await capacitorStorage.setItem(STORAGE_KEY, JSON.stringify(safeTabs)); } catch (e) {}
}

export async function addBrowserTab(tab: BrowserTab): Promise<BrowserTab[]> {
  const tabs = await getBrowserTabs();
  const existingIndex = tabs.findIndex(t => t.url === tab.url);
  const safeTab = sanitizeTab(tab);

  if (existingIndex >= 0) {
    const [existingTab] = tabs.splice(existingIndex, 1);
    tabs.unshift({ ...existingTab, ...safeTab });
  } else {
    tabs.unshift(safeTab);
  }
  
  await saveBrowserTabs(tabs);
  return tabs;
}

export async function removeBrowserTab(tabId: string): Promise<BrowserTab[]> {
  const tabs = await getBrowserTabs();
  const filtered = tabs.filter(t => t.id !== tabId);
  await saveBrowserTabs(filtered);
  return filtered;
}

export async function updateBrowserTab(tabId: string, updates: Partial<BrowserTab>): Promise<BrowserTab[]> {
  const tabs = await getBrowserTabs();
  const idx = tabs.findIndex(t => t.id === tabId);
  if (idx >= 0) {
    const merged = { ...tabs[idx], ...updates };
    tabs[idx] = sanitizeTab(merged);
  }
  await saveBrowserTabs(tabs);
  return tabs;
}

export async function deleteAllBrowserTabs(): Promise<void> {
  await saveBrowserTabs([]); 
  await setActiveTabId(null);
}

export async function getActiveTabId(): Promise<string | null> {
  return capacitorStorage.getItem(ACTIVE_TAB_KEY);
}

export async function setActiveTabId(id: string | null): Promise<void> {
  if (id) {
    await capacitorStorage.setItem(ACTIVE_TAB_KEY, id);
  } else {
    await capacitorStorage.removeItem(ACTIVE_TAB_KEY);
  }
}

export async function getBookmarks(): Promise<BrowserTab[]> {
  const raw = await capacitorStorage.getItem(BOOKMARKS_KEY);
  if (!raw) return [];
  try { 
      let b: BrowserTab[] = JSON.parse(raw);
      // Sort by position on load to respect user order
      return b.sort((a, b) => (a.position || 0) - (b.position || 0));
  } catch { return []; }
}

export async function saveBookmarks(bookmarks: BrowserTab[]): Promise<void> {
  const safeBookmarks = bookmarks.map((b, index) => sanitizeTab({
      ...b,
      position: index
  }));
  try { await capacitorStorage.setItem(BOOKMARKS_KEY, JSON.stringify(safeBookmarks)); } catch (e) {}
}

export async function addBookmark(tab: BrowserTab): Promise<BrowserTab[]> {
  const bookmarks = await getBookmarks();
  const existingIndex = bookmarks.findIndex(b => b.url === tab.url);
  
  const safeBookmark = sanitizeTab({
      ...tab,
      created_at: Date.now(),
      position: bookmarks.length 
  });
  
  if (existingIndex === -1) {
    bookmarks.push(safeBookmark);
  } else {
    bookmarks[existingIndex] = { ...bookmarks[existingIndex], ...safeBookmark };
  }
  
  await saveBookmarks(bookmarks);
  return bookmarks;
}

export async function removeBookmark(url: string): Promise<BrowserTab[]> {
  const bookmarks = await getBookmarks();
  const filtered = bookmarks.filter(b => b.url !== url);
  await saveBookmarks(filtered); // Will auto-reindex positions via saveBookmarks
  return filtered;
}

export async function isBookmarked(url: string): Promise<boolean> {
  const bookmarks = await getBookmarks();
  return bookmarks.some(b => b.url === url);
}

export function getFaviconForUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    //TODO: here add your own favicon proxy: return `https://xxx.com/${hostname}`;
    return '';
  } catch {
    return '';
  }
}

export function isValidUrl(input: string): boolean {
  if (!input) return false;
  const trimmed = input.trim();

  // 1. Check for Spaces (If it has spaces, it's definitely a search)
  if (/\s/.test(trimmed)) return false;

  // 2. Explicit Protocol or Localhost or IP Address -> ALWAYS URL
  // Matches: http://, https://, ftp://, file://, localhost, 192.168.1.1
  if (/^(https?:\/\/|ftp:\/\/|file:\/\/|localhost|(\d{1,3}\.){3}\d{1,3})/.test(trimmed)) {
    try { new URL(trimmed); return true; } catch { return false; }
  }

  // 3. "Lazy" Domain Check (User typed "google.com" without http)
  // We check against a whitelist of common TLDs to prevent "school.pdf" or "user.name" 
  // from being treated as websites.
  const commonTLDs = [
    // Global
    'com', 'net', 'org', 'edu', 'gov', 'mil', 'int', 'info', 'biz', 'name', 'pro',
    // Tech / Modern
    'io', 'co', 'app', 'dev', 'ai', 'me', 'tv', 'online', 'store', 'tech', 'site', 'xyz', 'cloud', 'blog',
    // European / Regional (Add your target regions here)
    'de', 'ch', 'at', 'eu', 'uk', 'fr', 'it', 'es', 'nl', 'pl', 'ru', 'br', 'jp', 'cn', 'in', 'au', 'ca', 'us', 'be', 'lu'
  ];

  // Regex looks for: string + dot + string (2+ chars)
  // e.g., match[0] = "google.com", match[4] = "com"
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.([a-zA-Z]{2,})$/;
  const match = trimmed.match(domainRegex);

  if (match) {
    const tld = match[match.length - 1].toLowerCase();
    
    // Exception: If the TLD is explicitly in our whitelist, it's a URL.
    if (commonTLDs.includes(tld)) {
      return true;
    }
  }

  // If it didn't pass the specific checks above, treat it as a Search Query.
  return false;
}

export function normalizeUrl(input: string): string {
  // If it's already a protocol, return as is
  if (/^https?:\/\//i.test(input) || /^file:\/\//i.test(input)) return input;
  
  // Otherwise, default to https
  return `https://${input}`;
}