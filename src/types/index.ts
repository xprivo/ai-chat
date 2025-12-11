export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  files?: FileReference[];
  images?: ImageReference[];
  isError?: boolean;
  searchResults?: SearchResults;
}

export interface SearchResults {
  success: boolean;
  content: string;
  serp: SearchResult[];
}

export interface SearchResult {
  position: number;
  title: string;
  link: string;
  redirect_link: string;
  favicon: string;
  snippet: string;
  snippet_highlighted_words: string[];
  source: string;
}

export interface FileReference {
  id: string;
  name: string;
  type: 'pdf' | 'csv' | 'excel' | 'doc';
  content: string;
}

export interface ImageReference {
  id: string;
  name: string;
  type: 'image';
  content: string; // base64 encoded image
  mimeType: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  systemPrompt?: string;
  temperature?: number;
  workspaceId?: string;
  expertId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  instructions?: string;
  expertId?: string;
  createdAt: Date;
  isPinned?: boolean;
}

export interface Expert {
  id: string;
  name: string;
  description: string;
  instructions: string;
  icon: string;
  createdAt: Date;
}

export type Language = 'en' | 'fr' | 'de' | 'es' | 'it' | 'nl' | 'pl' | 'da' | 'pt' | 'bg' | 'el' | 'sv' | 'cs' | 'hr' | 'sl' | 'hi';
export type Theme = 'light' | 'dark' | 'system';

export interface AIEndpoint {
  id: string;
  name: string;
  url: string;
  authorization: string;
  models: string[];
  enableWebSearch?: boolean;
  enableSafeWebSearch?: boolean;
}

export interface AISettings {
  endpoints: AIEndpoint[];
  selectedModel: string;
}

export interface APIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

export interface ChatAPIRequest {
  messages: APIMessage[];
}