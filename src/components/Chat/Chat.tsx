import { SETUP_CONFIG } from '../../config/setup';
import React, { useState, useRef, useEffect } from 'react'; // Import useRef
import { Chat as ChatType, Message, FileReference, ImageReference, APIMessage, SearchResults, Workspace, Expert } from '../../types';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { InfoBoxes } from './InfoBoxes';
import { sendChatMessage } from '../../utils/api';
import { useFiles, useDateSetting, useAISettings } from '../../hooks/useLocalStorage';
import { useTranslation } from '../../hooks/useTranslation';
import { SponsoredContent } from './SponsoredContent';
import { PremiumOverlay } from '../UI/PremiumOverlay';
import { ErrorOverlay } from '../UI/ErrorOverlay';
import { SplitChatOverlay } from '../UI/SplitChatOverlay';
import { CSRFManager } from '../../utils/csrf';
import { storage } from '../../utils/storage';
import { setupKeyboardHandler, cleanupKeyboardHandler } from '../../utils/keyboardHandler';
import { fetchProModels } from '../../utils/proModels';
import { Briefcase, Sparkles } from 'lucide-react';
 
interface ChatProps {
  chat: ChatType;
  onUpdateChat: (chat: ChatType) => void;
  onDeleteChat: () => void;
  workspaceInstructions?: string;
  expertInstructions?: string;
  toneInstructions?: string;
  workspaces: Workspace[];
  experts: Expert[];
  onUpdateExperts: (experts: Expert[]) => void;
  onDeleteExpert: (expertId: string) => void;
  onShowProOverlay: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

interface SearchBody {
  query: string;
  country?: string;
  lang?: string;
}

export default function Chat({ chat, onUpdateChat, onDeleteChat, workspaceInstructions, expertInstructions, toneInstructions, workspaces, experts, onUpdateExperts, onDeleteExpert, onShowProOverlay, onToggleSidebar, isSidebarOpen }: ChatProps) {
  const { t, i18n } = useTranslation();
  const { aiSettings, saveAISettings } = useAISettings();
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const streamingMessageRef = useRef('');
  const [searchKeywords, setSearchKeywords] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [chatFiles, setChatFiles] = useState<Record<string, string>>({});
  const [chatImages, setChatImages] = useState<Record<string, string>>({});
  const [currentChatTitle, setCurrentChatTitle] = useState(chat.title);
  const [sponsoredContent, setSponsoredContent] = useState<any[]>([]);
  const [isLoadingSponsoredContent, setIsLoadingSponsoredContent] = useState(false);
  const [isInfoBoxVisible, setInfoboxVisible] = useState(true);
  const [adsToken, setAdsToken] = useState('');

  const [languageToUse, setLanguageToUse] = useState(
    () => navigator.language.split('-')[0]
  );
  
  const customIcon = SETUP_CONFIG.menu_icon ? SETUP_CONFIG.menu_icon : null;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const prevChatMessagesLength = useRef(chat.messages.length);
  const prevStreamingMessageId = useRef<string | null>(null); 

  const abortControllerRef = useRef<AbortController | null>(null); 
  
  const { files, saveFile } = useFiles();
  const { useCurrentDate } = useDateSetting();
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [sourcesData, setSourcesData] = useState<any>(null);
  const [streamingSponsoredContent, setStreamingSponsoredContent] = useState<any[]>([]);
  const [streamingSponsoredContentTitle, setStreamingSponsoredContentTitle] = useState('');

  const [showPremiumOverlay, setShowPremiumOverlay] = useState(false);
  const [premiumOverlayType, setPremiumOverlayType] = useState<'premium_suggestion' | 'limit_reached'>('premium_suggestion');
  const [showSuggestedPremium, setShowSuggestedPremium] = useState(false);

  const [showErrorOverlay, setShowErrorOverlay] = useState(false);
  const [errorOverlayTitle, setErrorOverlayTitle] = useState('');
  const [errorOverlayText, setErrorOverlayText] = useState('');
  const [errorOverlayShowPro, setErrorOverlayShowPro] = useState(false);
  const [errorOverlayIcon, setErrorOverlayIcon] = useState('warning');

  const [hasProKey, setHasProKey] = useState(false);

  const [showSplitOverlay, setShowSplitOverlay] = useState(false);
  const [splitMessageId, setSplitMessageId] = useState<string | null>(null);
  
  // Default sponsored content fallback
  const defaultSponsoredContent = [];
  //Example:
  /*
  const defaultSponsoredContent = [
   {
      id: '1',
      sponsored_title: '',
      sponsored_desc_1: '',
      sponsored_desc_2: '',
      sponsored_notice: 'sponsored',
      save_text: '',
      url: 'https://www.example.com',
      image: '',
      svg: 'mail',
      advertiser_name: ""
    }
  ];
  */


  const getAIAuthorizationHeader = (modelEndpoint: any): string => {
    const proKey = localStorage.getItem('pro_key');
    if (proKey) {
      try {
        const url = new URL(modelEndpoint.url);
        if (url.hostname.startsWith('www.xprivo.com')) {
          return `Bearer ${proKey}`;
        }
      } catch (error) {
        console.error('Error parsing endpoint URL:', error);
      }
    }
    return modelEndpoint.authorization;
  };

  const getWebSearchAuthorizationHeader = (modelEndpoint: any): string => {
    const proKey = localStorage.getItem('pro_key');
    if (proKey) {
      return `Bearer ${proKey}`;
    }
    return modelEndpoint.authorization;
  };

  // Setup keyboard handler
  useEffect(() => {
    setupKeyboardHandler();
    return () => {
      cleanupKeyboardHandler();
    };
  }, []);

  useEffect(() => {
    const loadVisibility = async () => {
      try {
        const stored = await storage.settings.get('hideInfoBoxes');
        setInfoboxVisible(stored !== 'true');
      } catch (error) {
        //console.error('Error loading info boxes visibility:', error);
      }
    };

    loadVisibility();
  }, []);

  useEffect(() => {
    const loadLanguage = async () => {
      let lang;
      try {
        const savedLanguage = await storage.settings.get('language');
        lang = savedLanguage || navigator.language.split('-')[0];
      } catch (error) {
        lang = navigator.language.split('-')[0];
      }
      setLanguageToUse(lang);
    };
    loadLanguage();
  }, []);

  useEffect(() => {
    const loadSponsoredContent = async () => {
      let languageToUse;
      try {
        const savedLanguage = await storage.settings.get('language');
        languageToUse = savedLanguage || navigator.language.split('-')[0];
      } catch (error) {
        languageToUse = navigator.language.split('-')[0];
      }
      
      const proKey = localStorage.getItem('pro_key');
      
      if (proKey) {
        setSponsoredContent([]);
        return;
      }
      
      if (!SETUP_CONFIG.get_sponsored_content) {
        setSponsoredContent(defaultSponsoredContent);
        return;
      }
       
      setIsLoadingSponsoredContent(true);
      try {
        const queryParams = [];
        if (languageToUse) {
          queryParams.push(`lang=${languageToUse}`);
        }
        const sponsoredToken = localStorage.getItem('sp_token');
        if (sponsoredToken) {
          queryParams.push(`sponsor_token=${sponsoredToken}`);
        }
        const queryString = queryParams.join('&');
            
        const fetch_url = `https://www.xprivo.com/auth/sponsored${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(fetch_url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          if (data && typeof data === 'object' && data.sponsored_content && Array.isArray(data.sponsored_content)) {
            // Data structure is valid
            if (data.sponsored_content.length > 0) {
              // Array has content, so we set it
              setSponsoredContent(data.sponsored_content);
            } else {
              // API returned a valid, but empty, array. Use fallback.
              setSponsoredContent(defaultSponsoredContent);
            }
            
            if (data.sponsored_token) {
              localStorage.setItem('sp_token', data.sponsored_token);
            }
          } else {
            //Failed to fetch sponsored content, using fallback
            setSponsoredContent(defaultSponsoredContent);
          }
        } else {
          //Failed to fetch sponsored content, using fallback
          setSponsoredContent(defaultSponsoredContent);
        }
      } catch (error) {
        //Error fetching sponsored content
        setSponsoredContent(defaultSponsoredContent);
      } finally {
        setIsLoadingSponsoredContent(false);
      }
    };
    
    loadSponsoredContent();
  }, []);

  const handleFreeClick = () => {
     window.dispatchEvent(new CustomEvent('showErrorOverlay', {
        detail: {
          title: t('free_label_title'),
          text: t('free_label_text'),
          showProButton: true,
          icon: 'upgrade'
        }
      }));
  };

  const handleProtectedClick = () => {
     window.dispatchEvent(new CustomEvent('showErrorOverlay', {
        detail: {
          title: t('protected_label_title'),
          text: t('protected_label_text'),
          showProButton: false,
          icon: 'protected'
        }
      }));
  };
  
  useEffect(() => {
    const handleStorageChange = () => {
      const proKey = localStorage.getItem('pro_key');
      if (proKey) {
        setSponsoredContent([]);
      } else if (sponsoredContent.length === 0) {
        const loadSponsoredContent = async () => {
          if (!SETUP_CONFIG.get_sponsored_content) {
            setSponsoredContent(defaultSponsoredContent);
            return;
          }

          let languageToUse;
          try {
            const savedLanguage = await storage.settings.get('language');
            languageToUse = savedLanguage || navigator.language.split('-')[0];
          } catch (error) {
            console.error('Error getting language from storage, using browser default:', error);
            languageToUse = navigator.language.split('-')[0];
          }
          
          try { 
            const queryParams = [];
            if (languageToUse) {
              queryParams.push(`lang=${languageToUse}`);
            }
            const sponsoredToken = localStorage.getItem('sp_token');
            if (sponsoredToken) {
              queryParams.push(`sponsor_token=${sponsoredToken}`);
            }
            const queryString = queryParams.join('&');
            
            const fetch_url = `https://www.xprivo.com/auth/sponsored${queryString ? `?${queryString}` : ''}`;
            const response = await fetch(fetch_url);
            if (response.ok) {
              const data = await response.json();
              if (data && typeof data === 'object' && data.sponsored_content && Array.isArray(data.sponsored_content)) {
                // Data structure is valid
                if (data.sponsored_content.length > 0) {
                  // Array has content, so we set it
                  setSponsoredContent(data.sponsored_content);
                } else {
                  // API returned a valid, but empty, array. Use fallback.
                  setSponsoredContent(defaultSponsoredContent);
                }
                
                if (data.sponsored_token) {
                  localStorage.setItem('sp_token', data.sponsored_token);
                }
              } else {
                //Failed to fetch sponsored content, using fallback
                setSponsoredContent(defaultSponsoredContent);
              }
            } else {
              setSponsoredContent(defaultSponsoredContent);
            }
          } catch (error) {
            setSponsoredContent(defaultSponsoredContent);
          }
        };
        loadSponsoredContent();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('accountStatusChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('accountStatusChanged', handleStorageChange);
    };
  }, [sponsoredContent.length]);

  useEffect(() => {
    const checkProKey = () => {
      const proKey = localStorage.getItem('pro_key');
      setHasProKey(!!proKey);
    };
    checkProKey();
    window.addEventListener('storage', checkProKey);
    return () => window.removeEventListener('storage', checkProKey);
  }, []);

  useEffect(() => {
    const loadProModels = async () => {
      const proModelsData = await fetchProModels();

      if (proModelsData && proModelsData.extra_models) {
        const extraModels = proModelsData.extra_models;
        const extraModelNames = Object.keys(extraModels);

        const xprivoEndpoint = aiSettings.endpoints.find(ep => ep.id === 'default' || ep.name === 'xPrivo');

        if (xprivoEndpoint) {
          const currentXprivoModels = xprivoEndpoint.models.filter(m => m === 'xprivo');
          const updatedModels = [...currentXprivoModels, ...extraModelNames];

          const modelMetadata: Record<string, any> = {};
          extraModelNames.forEach(modelName => {
            modelMetadata[modelName] = extraModels[modelName];
          });

          const updatedEndpoint = {
            ...xprivoEndpoint,
            models: updatedModels,
            modelMetadata
          };

          const otherEndpoints = aiSettings.endpoints.filter(ep => ep.id !== xprivoEndpoint.id);
          const updatedEndpoints = [updatedEndpoint, ...otherEndpoints];

          let selectedModel = aiSettings.selectedModel;
          if (selectedModel !== 'xprivo' && !extraModelNames.includes(selectedModel)) {
            selectedModel = 'xprivo';
          }

          const updatedSettings = {
            ...aiSettings,
            endpoints: updatedEndpoints,
            selectedModel,
            extraModels
          };

          saveAISettings(updatedSettings);
        }
      }
    };

    loadProModels();
  }, []);
  
  useEffect(() => {
    const handleShowSources = (event: CustomEvent) => {
      setSourcesData(event.detail.results);
      setShowSourcesModal(true);
    };

    const handleShowPremiumOverlay = (event: CustomEvent) => {
      setPremiumOverlayType(event.detail.type);
      setShowPremiumOverlay(true);
    };

    const handleShowSuggestedPremium = (event: CustomEvent) => {
      setShowSuggestedPremium(true);
    };

    window.addEventListener('showSearchSources', handleShowSources as EventListener);
    window.addEventListener('showPremiumOverlay', handleShowPremiumOverlay as EventListener);
    window.addEventListener('showSuggestedPremium', handleShowSuggestedPremium as EventListener);

    const handleShowErrorOverlay = (event: CustomEvent) => {
      const { title, text, showProButton, icon } = event.detail;
      setErrorOverlayTitle(title);
      setErrorOverlayText(text);
      setErrorOverlayShowPro(showProButton || false);
      setShowErrorOverlay(true);
      setErrorOverlayIcon(icon);
    };

    window.addEventListener('showErrorOverlay', handleShowErrorOverlay as EventListener);

    return () => {
      window.removeEventListener('showSearchSources', handleShowSources as EventListener);
      window.removeEventListener('showPremiumOverlay', handleShowPremiumOverlay as EventListener);
      window.removeEventListener('showSuggestedPremium', handleShowSuggestedPremium as EventListener);
      window.removeEventListener('showErrorOverlay', handleShowErrorOverlay as EventListener);
    };
  }, []);

  useEffect(() => {
    setCurrentChatTitle(chat.title);
  }, [chat.title]);

  useEffect(() => {
    const handleChatTitleUpdate = (event: CustomEvent) => {
      const { chatId, title } = event.detail;
      if (chatId === chat.id) {
        setCurrentChatTitle(title);
      }
    };

    const handleChatTemperatureUpdate = (event: CustomEvent) => {
      const { chatId, temperature } = event.detail;
      if (chatId === chat.id) {
        const updatedChat = { ...chat, temperature, updatedAt: new Date() };
        onUpdateChat(updatedChat);
      }
    };

    const handleChatSystemPromptUpdate = (event: CustomEvent) => {
        const { chatId, systemPrompt } = event.detail;
        if (chatId === chat.id) {
            const updatedChat = { ...chat, systemPrompt, updatedAt: new Date() };
            onUpdateChat(updatedChat);
        }
    };

    window.addEventListener('chatTitleUpdated', handleChatTitleUpdate as EventListener);
    window.addEventListener('chatTemperatureUpdated', handleChatTemperatureUpdate as EventListener);
    window.addEventListener('chatSystemPromptUpdated', handleChatSystemPromptUpdate as EventListener);
    return () => {
      window.removeEventListener('chatTitleUpdated', handleChatTitleUpdate as EventListener);
      window.removeEventListener('chatTemperatureUpdated', handleChatTemperatureUpdate as EventListener);
      window.removeEventListener('chatSystemPromptUpdated', handleChatSystemPromptUpdate as EventListener);
    };
  }, [chat.id, chat, onUpdateChat]);

  // Update chat files and images when files or chat changes
  useEffect(() => {
    const currentChatFiles = Object.fromEntries(
      Object.entries(files).filter(([key]) => key.startsWith(`${chat.id}_file_`))
    );
    const currentChatImages = Object.fromEntries(
      Object.entries(files).filter(([key]) => key.startsWith(`${chat.id}_image_`))
    );
    setChatFiles(currentChatFiles);
    setChatImages(currentChatImages);
  }, [files, chat.id]);

  const availableFiles = Object.fromEntries(
    Object.entries(chatFiles).map(([key, content]) => {
      const fileName = key.replace(`${chat.id}_file_`, '');
      return [fileName, { id: key, name: fileName, content, type: 'doc' as const }];
    })
  );

  const availableImages = Object.fromEntries(
    Object.entries(chatImages).map(([key, content]) => {
      const imageName = key.replace(`${chat.id}_image_`, '');
      return [imageName, { id: key, name: imageName, content, type: 'image' as const, mimeType: 'image/jpeg' }];
    })
  );

  useEffect(() => {
    if (chat.messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
      }, 100);
    }
  }, [chat.id]);

  useEffect(() => {
    const currentMessagesLength = chat.messages.length;

    if (currentMessagesLength > prevChatMessagesLength.current && chat.messages[currentMessagesLength - 1]?.role === 'user') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    else if (streamingMessageId && streamingMessageId !== prevStreamingMessageId.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    prevChatMessagesLength.current = currentMessagesLength;
    prevStreamingMessageId.current = streamingMessageId;

  }, [chat.messages, streamingMessageId]);
  

  const handleSendMessage = async (content: string, messageFiles: FileReference[] = [], messageImages: ImageReference[] = [], selectedModel: string, requestType: string = 'auto') => {
    setStreamingSponsoredContent([]);
    setShowSuggestedPremium(false);
    
    const csrfManager = CSRFManager.getInstance();
    await csrfManager.refreshToken();
    
    if (!content.trim()) return;

    const stored = localStorage.getItem('aiSettings');
    let currentAISettings = aiSettings;
    
    if (stored) {
      try {
        currentAISettings = JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored AI settings:', error);
      }
    }

    const modelEndpoint = currentAISettings.endpoints.find(endpoint => {
      return endpoint.models.includes(selectedModel);
    });

    if (!modelEndpoint) {
      console.error('No endpoint found for model:', selectedModel);
      return;
    }

    const isSafeWebSearchEnabled = modelEndpoint.enableSafeWebSearch || false;
    
    // Get safeWebSearchActive from storage.settings (same as ChatInput.tsx)
    let safeWebSearchActive = false;
    try {
      const storedSafeWebSearch = await storage.settings.get('safeWebSearchActive');
      safeWebSearchActive = storedSafeWebSearch === 'true';
    } catch (error) {
      console.error('Error loading safeWebSearchActive:', error);
    }

    // Check if there are any attachments (files or images)
    messageFiles.forEach(file => {
      const fileKey = `${chat.id}_file_${file.name}`;
      saveFile(fileKey, file.content);
    });

    messageImages.forEach(image => {
      const imageKey = `${chat.id}_image_${image.name}`;
      saveFile(imageKey, image.content);
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      files: messageFiles,
      images: messageImages
    };

    const updatedMessages = [...chat.messages, userMessage];
    
    let updatedChat = {
      ...chat,
      messages: updatedMessages,
      updatedAt: new Date()
    };

    if (updatedMessages.length === 1 && userMessage.role === 'user') {
      const isDefaultTitle = ['New Chat', 'Nouveau Chat', 'Neuer Chat'].includes(chat.title);
      if (isDefaultTitle) {
        const newTitle = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        updatedChat.title = newTitle;
        setCurrentChatTitle(newTitle);
      }
    }

    onUpdateChat(updatedChat);

    let hasMentionedAttachments = false;
    const mentions = content.match(/@(\w+)/g); // Finds all words prefixed with @ (mentions)
    
    if (mentions) {
      for (const mention of mentions) {
        const itemName = mention.substring(1);
        if (availableFiles[itemName] || availableImages[itemName]) {
          hasMentionedAttachments = true;
          break;
        }
      }
    }
    
    if (isSafeWebSearchEnabled && safeWebSearchActive && !hasMentionedAttachments) {
      await handleSafeWebSearch(updatedMessages, userMessage, selectedModel, modelEndpoint, updatedChat);
    } else {
      await handleRegularMessage(updatedMessages, selectedModel, modelEndpoint, 'auto', updatedChat);
    }
  };
  
const handleSafeWebSearch = async (
    updatedMessages: Message[],
    userMessage: Message,
    selectedModel: string,
    modelEndpoint: any,
    updatedChat: ChatType
  ) => {
    setIsLoading(true);
    setIsSearching(true);
    setSearchKeywords('');
    
    abortControllerRef.current = new AbortController(); 
    const signal = abortControllerRef.current.signal; 

    try {
      const csrfManager = CSRFManager.getInstance();
      const csrfHeaders = await csrfManager.getCSRFHeaders();

      const currentDate = new Date().toLocaleDateString('de-DE');
      const keywordMessages: APIMessage[] = [
        {
          role: 'system',
          content: `Analyse this chat conversation and check what the user wants in the last chatmessage. Then turn the users request into a single google keyword so that it can be entered into a search engine and get an appropriate answer to the users request. For example output a good keyword like \'longest bridge in germany\' if the user asks about whats the longest bridge in germany. Only output the keyword and don\'t answer questions. Today's current date is ${currentDate}`
        },
        ...updatedMessages
      ];

      const keywordRequest = { messages: keywordMessages, model: selectedModel, temperature: 0.1, stream: false };

      const keywordResponse = await fetch(modelEndpoint.url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': getAIAuthorizationHeader(modelEndpoint),
          ...csrfHeaders
        },
        body: JSON.stringify(keywordRequest),
        signal: signal
      });

      if (!keywordResponse.ok) throw new Error('Failed to extract keywords');
      const keywordData = await keywordResponse.json();
      const keywords = keywordData.choices?.[0]?.message?.content?.trim() || '';
      if (keywords===''){
        setIsSearching(false); 
        await handleRegularMessage(updatedMessages, selectedModel, modelEndpoint, 'auto', updatedChat);
        return;
      }
      if (!keywords) throw new Error('No keywords extracted');
      setSearchKeywords(keywords);

      const bodyWebSearch: SearchBody = {
        query: keywords,
      };
      if (SETUP_CONFIG.webSearch.country) {
        bodyWebSearch.country = SETUP_CONFIG.webSearch.country;
      }
      if (SETUP_CONFIG.webSearch.add_lang) {
        bodyWebSearch.lang = languageToUse;
      }
      const requestBodyWebSearch = JSON.stringify(bodyWebSearch);
      
       const serpResponse = await fetch(SETUP_CONFIG.webSearch.endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': SETUP_CONFIG.webSearch.authorization
          ? SETUP_CONFIG.webSearch.authorization
          : getWebSearchAuthorizationHeader(modelEndpoint),
        ...csrfHeaders
        },
        body: requestBodyWebSearch,
        signal: signal
      });

      if (!serpResponse.ok) throw new Error('SERP API request failed');
      const serpData = await serpResponse.json();
      if (!serpData.success) throw new Error('SERP search failed');
      setSearchResults(serpData);
      setIsSearching(false);

      const userMessageWithSearch: Message = { ...userMessage, searchResults: serpData };
      const updatedMessagesWithSearch = [...updatedMessages.slice(0, -1), userMessageWithSearch];
      const chatWithSearch = { ...updatedChat, messages: updatedMessagesWithSearch, updatedAt: new Date() };
      
      onUpdateChat(chatWithSearch);

      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };
      const currentDateSearch = new Date().toLocaleDateString('en-GB', options);

      const enhancedContent = `${userMessage.content}\n\n---> Search Results (Up-To-Date as of ${currentDateSearch}):\n${serpData.content}`;

      await handleRegularMessageWithContent(
        updatedMessagesWithSearch.slice(0, -1),
        enhancedContent,
        userMessage.files || [],
        userMessage.images || [],
        selectedModel,
        modelEndpoint,
        chatWithSearch
      );
      
    } catch (error) {
      console.error('Safe web search error:', error);
      setIsSearching(false);
      if (!(error instanceof DOMException && error.name === 'AbortError')) { 
        await handleRegularMessage(updatedMessages, selectedModel, modelEndpoint, 'auto', updatedChat);
      }
    } finally {
      abortControllerRef.current = null;
    } 
  };

  const handleRegularMessage = async (
    updatedMessages: Message[],
    selectedModel: string,
    modelEndpoint: any,
    requestType: string,
    updatedChat: ChatType
  ) => {
    const shouldIncludeRequestType = modelEndpoint.enableWebSearch || false;
    const finalRequestType = shouldIncludeRequestType ? requestType : undefined;
    
    setIsLoading(true);
    const apiMessages: APIMessage[] = [];
    
    const systemParts = [];

    if (useCurrentDate) {
      const today = new Date();
      const day = today.toLocaleDateString('en-GB', { day: '2-digit' });
      const month = today.toLocaleDateString('en-US', { month: 'long' });
      const year = today.getFullYear();

      const currentDate = `${day}. ${month} ${year}`;
      systemParts.push(`Today is ${currentDate}`);
    }

    if (workspaceInstructions) {
      systemParts.push(workspaceInstructions);
    }

    if (expertInstructions) {
      systemParts.push(expertInstructions);
    }

    if (toneInstructions && !expertInstructions) {
      systemParts.push(toneInstructions);
    }

    if (chat.systemPrompt) {
      systemParts.push(chat.systemPrompt);
    }

    const systemPrompt = systemParts.join('\n\n');
    if (systemPrompt) {
      apiMessages.push({ role: 'system', content: systemPrompt });
    }

    updatedMessages.forEach(msg => {
      if (msg.role === 'user') {
        let processedContent = msg.content;
        const mentions = msg.content.match(/@(\w+)/g);
        if (mentions) {
          let appendContent = '';
          mentions.forEach(mention => {
            const itemName = mention.slice(1);
            const fileKey = `${chat.id}_file_${itemName}`;
            const fileContent = files[fileKey];
            if (fileContent) {
              appendContent += `\n\n${itemName} (file):\n${fileContent}`;
            }
          });
          if (appendContent) processedContent += appendContent;
        }

        const hasAttachedImages = msg.images && msg.images.length > 0;
        const mentionedImageNames = mentions?.map(m => m.slice(1)).filter(name => availableImages[name]) || [];
        const hasImages = hasAttachedImages || mentionedImageNames.length > 0;

        if (hasImages) {
          const contentArray: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string }; }> = [{ type: 'text', text: processedContent }];
          if (msg.images) msg.images.forEach(image => contentArray.push({ type: 'image_url', image_url: { url: image.content } }));
          mentionedImageNames.forEach(imageName => {
            const imageRef = availableImages[imageName];
            if (imageRef) contentArray.push({ type: 'image_url', image_url: { url: imageRef.content } });
          });
          apiMessages.push({ role: msg.role, content: contentArray });
        } else {
          apiMessages.push({ role: msg.role, content: processedContent });
        }
      } else {
        apiMessages.push({ role: msg.role, content: msg.content });
      }
    });

    const apiRequest: any = {
      messages: apiMessages,
      model: selectedModel,
      endpoint: modelEndpoint.url,
      authorization: modelEndpoint.authorization,
      ...(finalRequestType && { request_type: finalRequestType }),
      ...(SETUP_CONFIG.add_ads_token && { ads_token: adsToken }),
      ...(SETUP_CONFIG.add_chat_language && { chat_language: languageToUse }),
    };

    const chatTemperature = chat.temperature ?? 0.2;
    if (chatTemperature >= 0 && chatTemperature <= 2) {
      apiRequest.temperature = chatTemperature;
    }

    const streamingId = (Date.now() + 1).toString();
    setStreamingMessageId(streamingId);
    setStreamingMessage('');
    streamingMessageRef.current = '';

    abortControllerRef.current = new AbortController(); 
    const signal = abortControllerRef.current.signal; 

    await sendChatMessage(apiRequest,
      (chunk) => {
        streamingMessageRef.current += chunk;
        setStreamingMessage(prev => prev + chunk);
      },
      (adstoken) => setAdsToken(adstoken),
      (adstitle) => setStreamingSponsoredContentTitle(adstitle),
      (ads) => setStreamingSponsoredContent(ads),
      (error) => {
        setIsLoading(false);
        setStreamingMessage('');
        setStreamingMessageId(null);
        streamingMessageRef.current = '';
        setStreamingSponsoredContent([]);
        abortControllerRef.current = null;

        console.error("An error occurred:", error);

        const errorMessage: Message = { id: streamingId, content: t('errorTryAgain'), role: 'assistant', timestamp: new Date(), isError: true };
        onUpdateChat({ ...updatedChat, messages: [...updatedMessages, errorMessage], updatedAt: new Date() });
      },
      () => {
        setIsLoading(false);
        const finalContent = streamingMessageRef.current;
        if (finalContent && finalContent.trim()) {
          const assistantMessage: Message = { id: streamingId, content: finalContent, role: 'assistant', timestamp: new Date() };
          const finalUpdatedChat = { ...updatedChat, messages: [...updatedMessages, assistantMessage], updatedAt: new Date() };
          setStreamingMessage('');
          streamingMessageRef.current = '';
          setStreamingMessageId(null);
          onUpdateChat(finalUpdatedChat);
        } else {
          setStreamingMessage('');
          streamingMessageRef.current = '';
          setStreamingMessageId(null);
        }
        abortControllerRef.current = null;
      },
      signal,
      t
    );
  };
  

  const handleRegularMessageWithContent = async (
    previousMessages: Message[],
    enhancedContent: string,
    messageFiles: FileReference[],
    messageImages: ImageReference[],
    selectedModel: string,
    modelEndpoint: any,
    chatWithSearchResults: ChatType
  ) => {
    const enhancedUserMessage: Message = { id: Date.now().toString(), content: enhancedContent, role: 'user', timestamp: new Date(), files: messageFiles, images: messageImages };
    const messagesForAPI = [...previousMessages, enhancedUserMessage];
    const apiMessages: APIMessage[] = [];
    
    const systemParts = [];

    if (useCurrentDate) {
      const today = new Date();
      const day = today.toLocaleDateString('en-GB', { day: '2-digit' });
      const month = today.toLocaleDateString('en-US', { month: 'long' });
      const year = today.getFullYear();

      const currentDate = `${day}. ${month} ${year}`;
      systemParts.push(`Today is ${currentDate}`);
    }

    if (workspaceInstructions) {
      systemParts.push(workspaceInstructions);
    }

    if (expertInstructions) {
      systemParts.push(expertInstructions);
    }

    if (toneInstructions && !expertInstructions) {
      systemParts.push(toneInstructions);
    }

    if (chatWithSearchResults.systemPrompt) {
      systemParts.push(chatWithSearchResults.systemPrompt);
    }

    const systemPrompt = systemParts.join('\n\n');
    if (systemPrompt) apiMessages.push({ role: 'system', content: systemPrompt });

    messagesForAPI.forEach(msg => {
      if (msg.role === 'user') {
        let processedContent = msg.content;
        const mentions = msg.content.match(/@(\w+)/g);
        if (mentions) {
          let appendContent = '';
          mentions.forEach(mention => {
            const itemName = mention.slice(1);
            const fileKey = `${chatWithSearchResults.id}_file_${itemName}`;
            const fileContent = files[fileKey];
            if (fileContent) appendContent += `\n\n${itemName} (file):\n${fileContent}`;
          });
          if (appendContent) processedContent += appendContent;
        }

        const hasAttachedImages = msg.images && msg.images.length > 0;
        const mentionedImageNames = mentions?.map(m => m.slice(1)).filter(name => availableImages[name]) || [];
        const hasImages = hasAttachedImages || mentionedImageNames.length > 0;

        if (hasImages) {
          const contentArray: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string }; }> = [{ type: 'text', text: processedContent }];
          if (msg.images) msg.images.forEach(image => contentArray.push({ type: 'image_url', image_url: { url: image.content } }));
          mentionedImageNames.forEach(imageName => {
            const imageRef = availableImages[imageName];
            if (imageRef) contentArray.push({ type: 'image_url', image_url: { url: imageRef.content } });
          });
          apiMessages.push({ role: msg.role, content: contentArray });
        } else {
          apiMessages.push({ role: msg.role, content: processedContent });
        }
      } else {
        apiMessages.push({ role: msg.role, content: msg.content });
      }
    });

    const apiRequest: any = { messages: apiMessages, model: selectedModel, temperature: chatWithSearchResults.temperature ?? 0.2, endpoint: modelEndpoint.url, authorization: modelEndpoint.authorization, ...(SETUP_CONFIG.add_ads_token && { ads_token: adsToken }), ...(SETUP_CONFIG.add_chat_language && { chat_language: languageToUse })};
    const streamingId = (Date.now() + 1).toString();
    setStreamingMessageId(streamingId);
    setStreamingMessage('');
    streamingMessageRef.current = '';

    abortControllerRef.current = new AbortController(); 
    const signal = abortControllerRef.current.signal; 

    await sendChatMessage(apiRequest,
      (chunk) => {
        streamingMessageRef.current += chunk;
        setStreamingMessage(prev => prev + chunk);
      },
      (adstoken) => setAdsToken(adstoken),
      (adstitle) => setStreamingSponsoredContentTitle(adstitle),
      (ads) => setStreamingSponsoredContent(ads),
      (error) => { 
        setIsLoading(false);
        setStreamingMessage('');
        streamingMessageRef.current = '';
        setStreamingMessageId(null);
        setStreamingSponsoredContent([]);

        console.error("An error occurred:", error);

        const errorMessage: Message = { id: streamingId, content: t('errorTryAgain'), role: 'assistant', timestamp: new Date(), isError: true };

        onUpdateChat({ ...chatWithSearchResults, messages: [...chatWithSearchResults.messages, errorMessage], updatedAt: new Date() });
      },
      () => {
        setIsLoading(false);
        const finalContent = streamingMessageRef.current;
        if (finalContent && finalContent.trim()) {
          const assistantMessage: Message = { id: streamingId, content: finalContent, role: 'assistant', timestamp: new Date() };
          const finalUpdatedChat = { ...chatWithSearchResults, messages: [...chatWithSearchResults.messages, assistantMessage], updatedAt: new Date() };
          setStreamingMessage('');
          streamingMessageRef.current = '';
          setStreamingMessageId(null);
          onUpdateChat(finalUpdatedChat);
        } else {
          setStreamingMessage('');
          streamingMessageRef.current = '';
          setStreamingMessageId(null);
        }
        abortControllerRef.current = null;
      },
      signal,
      t
    );
  };

  const handleSendMessageIsolated = async (
    newMessagesArray: Message[], 
    userContent: string, 
    userFiles: FileReference[], 
    userImages: ImageReference[],
    selectedModel?: string,
    requestType: string = 'auto'
  ) => {
    setStreamingSponsoredContent([]);
    const stored = localStorage.getItem('aiSettings');
    let currentAISettings = aiSettings;
    if (stored) {
      try { currentAISettings = JSON.parse(stored); }
      catch (error) { console.error('Error parsing stored AI settings:', error); }
    }
    const modelToUse = selectedModel || currentAISettings.selectedModel;
    const modelEndpoint = currentAISettings.endpoints.find(endpoint => endpoint.models.includes(modelToUse));

    if (!modelEndpoint) { console.error('No endpoint found for model:', modelToUse); return; }
    
    const shouldIncludeRequestType = modelEndpoint.enableWebSearch || false;
    const finalRequestType = shouldIncludeRequestType ? requestType : undefined;
    setIsLoading(true);
    
    const apiMessages: APIMessage[] = [];
    
    const systemParts = [];

    if (useCurrentDate) {
      const today = new Date();
      const day = today.toLocaleDateString('en-GB', { day: '2-digit' });
      const month = today.toLocaleDateString('en-US', { month: 'long' });
      const year = today.getFullYear();

      const currentDate = `${day}. ${month} ${year}`;
      systemParts.push(`Today is ${currentDate}`);
    }

    if (workspaceInstructions) {
      systemParts.push(workspaceInstructions);
    }

    if (expertInstructions) {
      systemParts.push(expertInstructions);
    }

    if (toneInstructions && !expertInstructions) {
      systemParts.push(toneInstructions);
    }

    if (chat.systemPrompt) {
      systemParts.push(chat.systemPrompt);
    }

    const systemPrompt = systemParts.join('\n\n');
    if (systemPrompt) apiMessages.push({ role: 'system', content: systemPrompt });

    newMessagesArray.forEach(msg => {
      if (msg.role === 'user') {
        let processedContent = msg.content;
        const mentions = msg.content.match(/@(\w+)/g);
        if (mentions) {
          let appendContent = '';
          mentions.forEach(mention => {
            const itemName = mention.slice(1);
            const fileKey = `${chat.id}_file_${itemName}`;
            const fileContent = files[fileKey];
            if (fileContent) appendContent += `\n\n${itemName} (file):\n${fileContent}`;
          });
          if (appendContent) processedContent += appendContent;
        }

        const hasAttachedImages = msg.images && msg.images.length > 0;
        const mentionedImageNames = mentions?.map(m => m.slice(1)).filter(name => availableImages[name]) || [];
        const hasImages = hasAttachedImages || mentionedImageNames.length > 0;

        if (hasImages) {
          const contentArray: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string }; }> = [{ type: 'text', text: processedContent }];
          if (msg.images) msg.images.forEach(image => contentArray.push({ type: 'image_url', image_url: { url: image.content } }));
          mentionedImageNames.forEach(imageName => {
            const imageRef = availableImages[imageName];
            if (imageRef) contentArray.push({ type: 'image_url', image_url: { url: imageRef.content } });
          });
          apiMessages.push({ role: msg.role, content: contentArray });
        } else {
          apiMessages.push({ role: msg.role, content: processedContent });
        }
      } else {
        apiMessages.push({ role: msg.role, content: msg.content });
      }
    });

    const apiRequest: any = {
      messages: apiMessages,
      model: modelToUse,
      temperature: chat.temperature ?? 0.2,
      endpoint: modelEndpoint.url,
      authorization: modelEndpoint.authorization,
      ...(finalRequestType && { request_type: finalRequestType }),
      ...(SETUP_CONFIG.add_ads_token && { ads_token: adsToken }),
      ...(SETUP_CONFIG.add_chat_language && { chat_language: languageToUse }),
    };

    const streamingId = (Date.now() + 1).toString();
    setStreamingMessageId(streamingId);
    setStreamingMessage('');
    streamingMessageRef.current = '';

    abortControllerRef.current = new AbortController(); 
    const signal = abortControllerRef.current.signal; 

    await sendChatMessage(apiRequest,
      (chunk) => {
        streamingMessageRef.current += chunk;
        setStreamingMessage(prev => prev + chunk);
      },
      (adstoken) => { setAdsToken(adstoken) },
      (sponsoredAdsTitle) => { setStreamingSponsoredContentTitle(sponsoredAdsTitle) },
      (sponsoredAds) => {
        setStreamingSponsoredContent(sponsoredAds);
      },
      (error) => {
        setIsLoading(false);
        setStreamingMessage('');
        streamingMessageRef.current = '';
        setStreamingMessageId(null);
        setStreamingSponsoredContentTitle('');
        setStreamingSponsoredContent([]);

        console.error("An error occurred:", error);

        const errorMessage: Message = { id: streamingId, content: t('errorTryAgain'), role: 'assistant', timestamp: new Date(), isError: true };
        onUpdateChat({ ...chat, messages: [...newMessagesArray, errorMessage], updatedAt: new Date() });
      },
      () => {
        const finalContent = streamingMessageRef.current;
        if (finalContent && finalContent.trim()) {
          const assistantMessage: Message = { id: streamingId, content: finalContent, role: 'assistant', timestamp: new Date() };
          const finalUpdatedChat: ChatType = { ...chat, messages: [...newMessagesArray, assistantMessage], updatedAt: new Date() };
          setStreamingMessage('');
          streamingMessageRef.current = '';
          setStreamingMessageId(null);
          setIsLoading(false);
          onUpdateChat(finalUpdatedChat);
        } else {
          setStreamingMessage('');
          streamingMessageRef.current = '';
          setStreamingMessageId(null);
          setIsLoading(false);
        }
        abortControllerRef.current = null;
      },
      signal,
      t
    );
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) { 
      abortControllerRef.current.abort(); 
      //'Streaming stopped by user.'; 
      setIsLoading(false); 
      setIsSearching(false); 
      setStreamingMessage(''); 
      setStreamingMessageId(null); 
      streamingMessageRef.current = ''; 
      setStreamingSponsoredContent([]); 
      abortControllerRef.current = null; 
    } 
  }; 

  const handleEditMessage = (messageId: string, newContent: string) => {
    setStreamingSponsoredContent([]);
    setShowSuggestedPremium(false);
    const messageIndex = chat.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const originalMessage = chat.messages[messageIndex];
    const editedMessage: Message = { ...originalMessage, content: newContent.trim(), timestamp: new Date(), searchResults: null };

    // If editing an assistant message, just update it in place without removing subsequent messages
    if (originalMessage.role === 'assistant') {
      const updatedMessages = [...chat.messages];
      updatedMessages[messageIndex] = editedMessage;
      const updatedChat: ChatType = { ...chat, messages: updatedMessages, updatedAt: new Date() };
      onUpdateChat(updatedChat);
      return;
    }

    // For user messages, slice and regenerate
    const newMessagesArray: Message[] = chat.messages.slice(0, messageIndex);
    newMessagesArray.push(editedMessage);

    const updatedChat: ChatType = { ...chat, messages: newMessagesArray, updatedAt: new Date() };
    onUpdateChat(updatedChat);

    if (originalMessage.role === 'user') {
      const stored = localStorage.getItem('aiSettings');
      let currentAISettings = aiSettings;
      if (stored) { try { currentAISettings = JSON.parse(stored); } catch (error) { console.error('Error parsing stored AI settings:', error); } }
      const modelEndpoint = currentAISettings.endpoints.find(endpoint => endpoint.models.includes(aiSettings.selectedModel));
      const isSafeWebSearchEnabled = modelEndpoint?.enableSafeWebSearch || false;
      const isWebSearchEnabled = modelEndpoint?.enableWebSearch || false;

      // Check if the edited message has attachments
      const hasAttachments = (originalMessage.files && originalMessage.files.length > 0) || 
                            (originalMessage.images && originalMessage.images.length > 0);
      setTimeout(async () => {
        // Get the current request type setting for web search
        let requestType = 'auto';
        let safeWebSearchActive = false;
        
        try {
          const storedSafeWebSearch = await storage.settings.get('safeWebSearchActive');
          safeWebSearchActive = storedSafeWebSearch === 'true';
        } catch (error) {
          console.error('Error loading safeWebSearchActive:', error);
        }
        
        if (isWebSearchEnabled && !isSafeWebSearchEnabled) {
          try {
            const storedRequestType = await storage.settings.get('requestType');
            requestType = storedRequestType || 'auto';
          } catch (error) {
            console.error('Error loading requestType:', error);
          }
        }

        let hasMentionedAttachments = false;
        const mentions = newContent.match(/@(\w+)/g); // Finds all words prefixed with @ (mentions)
        
        if (mentions) {
          for (const mention of mentions) {
            const itemName = mention.substring(1);
            if (availableFiles[itemName] || availableImages[itemName]) {
              hasMentionedAttachments = true;
              break; // Found at least one valid mention, no need to check further
            }
          }
        }
        
        if (isSafeWebSearchEnabled && safeWebSearchActive && !hasMentionedAttachments) {
          handleSafeWebSearch(newMessagesArray, editedMessage, aiSettings.selectedModel, modelEndpoint, updatedChat);
        } else {
          handleSendMessageIsolated(
            newMessagesArray, 
            newContent.trim(), 
            originalMessage.files || [],
            originalMessage.images || [], 
            aiSettings.selectedModel, 
            requestType
          );
        }
      }, 50);
    }
  };

  const handleRetryMessage = (messageId: string) => {
    setStreamingSponsoredContent([]);
    setShowSuggestedPremium(false);
    const messageIndex = chat.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    let userMessageIndex = -1;
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (chat.messages[i].role === 'user') {
        userMessageIndex = i;
        break;
      }
    }
    if (userMessageIndex === -1) return;
    
    const userMessage = chat.messages[userMessageIndex];
    const newMessagesArray: Message[] = chat.messages.slice(0, userMessageIndex + 1);
    const updatedChat: ChatType = { ...chat, messages: newMessagesArray, updatedAt: new Date() };
    onUpdateChat(updatedChat);

    setTimeout(async () => {
      // Get the current request type setting for web search
      let requestType = 'auto';
      const stored = localStorage.getItem('aiSettings');
      let currentAISettings = aiSettings;
      if (stored) { 
        try { 
          currentAISettings = JSON.parse(stored); 
        } catch (error) { 
          console.error('Error parsing stored AI settings:', error); 
        } 
      }
      const modelEndpoint = currentAISettings.endpoints.find(endpoint => endpoint.models.includes(aiSettings.selectedModel));
      const isWebSearchEnabled = modelEndpoint?.enableWebSearch || false;
      const isSafeWebSearchEnabled = modelEndpoint?.enableSafeWebSearch || false;
      
      // Check if the user message has attachments
      const hasAttachments = (userMessage.files && userMessage.files.length > 0) || 
                            (userMessage.images && userMessage.images.length > 0);
      
      if (isWebSearchEnabled && !isSafeWebSearchEnabled) {
        try {
          const storedRequestType = await storage.settings.get('requestType');
          requestType = storedRequestType || 'auto';
        } catch (error) {
          console.error('Error loading requestType:', error);
        }
      }
      
      let safeWebSearchActive = false;
      if (isSafeWebSearchEnabled) {
        try {
          const storedSafeWebSearch = await storage.settings.get('safeWebSearchActive');
          safeWebSearchActive = storedSafeWebSearch === 'true';
        } catch (error) {
          console.error('Error loading safeWebSearchActive:', error);
        }
      }
      
      let hasMentionedAttachments = false;
      const mentions = userMessage.content.match(/@(\w+)/g); // Finds all words prefixed with @ (mentions)
      
      if (mentions) {
        for (const mention of mentions) {
          const itemName = mention.substring(1);
          if (availableFiles[itemName] || availableImages[itemName]) {
            hasMentionedAttachments = true;
            break; // Found at least one valid mention, no need to check further
          }
        }
      }
      
      if (isSafeWebSearchEnabled && safeWebSearchActive && !hasMentionedAttachments) {
        handleSafeWebSearch(newMessagesArray, userMessage, aiSettings.selectedModel, modelEndpoint, updatedChat);
      } else {
        handleSendMessageIsolated(
          newMessagesArray, 
          userMessage.content, 
          userMessage.files || [],
          userMessage.images || [], 
          aiSettings.selectedModel, 
          requestType
        );
      }
    }, 50);
  };

  const handleUpdateChatTitle = (title: string) => {
    const updatedChat = { ...chat, title: title.trim(), updatedAt: new Date() };
    setCurrentChatTitle(title.trim());
    onUpdateChat(updatedChat);
    
    window.dispatchEvent(new CustomEvent('chatTitleUpdated', {
      detail: { chatId: chat.id, title: title.trim() }
    }));
  };

  const handleUpdateTemperature = (temperature: number) => {
    const updatedChat = { ...chat, temperature, updatedAt: new Date() };
    onUpdateChat(updatedChat);
    window.dispatchEvent(new CustomEvent('chatTemperatureUpdated', {
      detail: { chatId: chat.id, temperature }
    }));
  };

  const handleUpdateSystemPrompt = (systemPrompt: string) => {
    const updatedChat = { ...chat, systemPrompt, updatedAt: new Date() };
    onUpdateChat(updatedChat);
    window.dispatchEvent(new CustomEvent('chatSystemPromptUpdated', {
      detail: { chatId: chat.id, systemPrompt }
    }));
  };

  const handleMentionFile = (fileName: string) => {
    if ((window as any).addMentionToInput) {
      (window as any).addMentionToInput(fileName);
    }
  };

  const handleFileProcessed = (file: FileReference) => {
    const fileKey = `${chat.id}_file_${file.name}`;
    saveFile(fileKey, file.content);
  };

  const handleImageProcessed = (image: ImageReference) => {
    const imageKey = `${chat.id}_image_${image.name}`;
    saveFile(imageKey, image.content);
  };

  const handleSplitMessage = (messageId: string) => {
    setSplitMessageId(messageId);
    setShowSplitOverlay(true);
  };

  const handleConfirmSplit = async (newTitle: string) => {
    if (!splitMessageId) return;

    const messageIndex = chat.messages.findIndex(m => m.id === splitMessageId);
    if (messageIndex === -1) return;

    const messagesUpToSplit = chat.messages.slice(0, messageIndex + 1);

    const newChatId = `chat_${Date.now()}`;

    const currentStoredFiles = await storage.files.get();
    const allFiles = currentStoredFiles ? JSON.parse(currentStoredFiles) : {};

    const filesToCopy: Record<string, string> = {};

    const copiedMessages = messagesUpToSplit.map((message) => {
      const copiedMessage = { ...message };

      if (message.files && message.files.length > 0) {
        copiedMessage.files = message.files.map((file) => {
          const oldFileKey = `${chat.id}_file_${file.name}`;
          const newFileKey = `${newChatId}_file_${file.name}`;
          const fileContent = allFiles[oldFileKey] || file.content;

          if (fileContent) {
            filesToCopy[newFileKey] = fileContent;
          }

          return {
            ...file,
            id: newFileKey
          };
        });
      }

      if (message.images && message.images.length > 0) {
        copiedMessage.images = message.images.map((image) => {
          const oldImageKey = `${chat.id}_image_${image.name}`;
          const newImageKey = `${newChatId}_image_${image.name}`;
          const imageContent = allFiles[oldImageKey] || image.content;

          if (imageContent) {
            filesToCopy[newImageKey] = imageContent;
          }

          return {
            ...image,
            id: newImageKey
          };
        });
      }

      const mentions = message.content.match(/@(\w+)/g);
      if (mentions) {
        mentions.forEach(mention => {
          const itemName = mention.slice(1);

          const oldFileKey = `${chat.id}_file_${itemName}`;
          if (allFiles[oldFileKey] && !filesToCopy[`${newChatId}_file_${itemName}`]) {
            filesToCopy[`${newChatId}_file_${itemName}`] = allFiles[oldFileKey];
          }

          const oldImageKey = `${chat.id}_image_${itemName}`;
          if (allFiles[oldImageKey] && !filesToCopy[`${newChatId}_image_${itemName}`]) {
            filesToCopy[`${newChatId}_image_${itemName}`] = allFiles[oldImageKey];
          }
        });
      }

      return copiedMessage;
    });

    const allOldFileKeys = Object.keys(allFiles).filter(key => key.startsWith(`${chat.id}_`));
    allOldFileKeys.forEach(oldKey => {
      const suffix = oldKey.substring(chat.id.length + 1);
      const newKey = `${newChatId}_${suffix}`;
      if (!filesToCopy[newKey] && allFiles[oldKey]) {
        filesToCopy[newKey] = allFiles[oldKey];
      }
    });

    if (Object.keys(filesToCopy).length > 0) {
      const updatedFiles = { ...allFiles, ...filesToCopy };
      try {
        await storage.files.set(JSON.stringify(updatedFiles));

        window.dispatchEvent(new CustomEvent('filesUpdated', {
          detail: { files: updatedFiles }
        }));
      } catch (error) {
        console.error('Error copying files:', error);
      }
    }

    const newChat: ChatType = {
      id: newChatId,
      title: newTitle,
      messages: copiedMessages,
      systemPrompt: chat.systemPrompt,
      temperature: chat.temperature,
      workspaceId: chat.workspaceId,
      expertId: chat.expertId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    window.dispatchEvent(new CustomEvent('addNewChat', {
      detail: { chat: newChat }
    }));

    setSplitMessageId(null);
  };

  const displayMessages = [...chat.messages];
  if (streamingMessage && streamingMessageId && !chat.messages.find(m => m.id === streamingMessageId)) {
    displayMessages.push({
      id: streamingMessageId,
      content: streamingMessage,
      role: 'assistant',
      timestamp: new Date()
    });
  }

  const totalItemCount = Object.keys(availableFiles).length + Object.keys(availableImages).length;

  const displayChat = {
    ...chat,
    title: currentChatTitle
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <ChatHeader
        chat={displayChat}
        fileCount={totalItemCount}
        files={chatFiles}
        images={chatImages}
        onUpdateChatTitle={handleUpdateChatTitle}
        onUpdateTemperature={handleUpdateTemperature}
        onUpdateSystemPrompt={handleUpdateSystemPrompt}
        onDeleteChat={onDeleteChat}
        onMentionFile={handleMentionFile}
        onToggleSidebar={onToggleSidebar}
        isSidebarOpen={isSidebarOpen}
        workspaces={workspaces}
        experts={experts}
        onUpdateExperts={onUpdateExperts}
        onDeleteExpert={onDeleteExpert}
        onUpdateChat={onUpdateChat}
      />

      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto" style={{
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'calc(220px + env(safe-area-inset-bottom))'
        }}>
          <div className="mx-auto max-w-[1200px]">
            {chat.messages.length === 0 && (
              <div className="p-4 text-center max-w-4xl mx-auto mb-8">
                {chat.workspaceId && (() => {
                  const workspace = workspaces.find(w => w.id === chat.workspaceId);
                  if (workspace) {
                    return (
                      <div className="flex items-center justify-center gap-2 mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                        <Briefcase size={18} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {workspace.name}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {chat.expertId && (() => {
                  const expert = experts.find(e => e.id === chat.expertId);
                  if (expert) {
                    return (
                      <div className="flex items-center justify-center gap-2 mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                        <Sparkles size={18} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          Expert: {expert.name}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {customIcon && (
                  <img
                    src={customIcon}
                    alt={SETUP_CONFIG.appName + ' Logo'}
                    className="h-10 w-10 rounded-md object-cover mx-auto"
                  />
                )}


                <div className="flex flex-col items-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {SETUP_CONFIG.appName}
                  </h1>

                  <div className="flex items-center gap-3 mt-2">
                    {hasProKey ? (
                          <span className="
                            inline-block
                            px-3 py-0.5
                            rounded-full
                            text-xs font-semibold text-white dark:text-black
                            bg-black dark:bg-white
                          ">
                            PRO
                          </span>
                      ):
                      (
                         <span onClick={(e) => handleFreeClick()} className="
                          inline-block
                          px-2.5 py-0.5
                          rounded-full 
                          text-xs font-medium
                          bg-gray-200 text-gray-700
                          dark:bg-gray-800 dark:text-gray-300 cursor-pointer
                        ">
                           {t('free_label')}
                        </span>
                      )}                
                  </div>

                </div>
                
                {!isLoadingSponsoredContent && sponsoredContent.length > 0 && streamingSponsoredContent.length === 0 && (
                  <div className="max-w-4xl mx-auto mb-8">
                    <SponsoredContent ads={sponsoredContent} t={t} />
                  </div>
                )}
                {sponsoredContent.length === 0 && (
                  <div className="max-w-4xl mx-auto">
                    <InfoBoxes />
                  </div>
                )}
              </div>
            )}
              
              <MessageList
                messages={displayMessages}
                availableImages={availableImages}
                streamingSponsoredContentTitle={streamingSponsoredContentTitle}
                streamingSponsoredContent={streamingSponsoredContent}
                showSuggestedPremium={showSuggestedPremium}
                onDismissSuggestedPremium={() => setShowSuggestedPremium(false)}
                onShowPremiumOverlay={() => {
                  setPremiumOverlayType('premium_suggestion');
                  setShowPremiumOverlay(true);
                }}
                onEditMessage={handleEditMessage}
                onRetryMessage={handleRetryMessage}
                onSplitMessage={handleSplitMessage}
                isLoading={isLoading}
                streamingMessage={streamingMessage}
                streamingMessageId={streamingMessageId}
                searchKeywords={searchKeywords}
                searchResults={searchResults}
                isSearching={isSearching}
                messagesEndRef={messagesEndRef}
              />
              </div>
        </div>


            <div className="fixed left-0 right-0 z-30 lg:left-64 max-w-[1000px] mx-auto"
              style={{
                bottom: '0',
                paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
              }}
            >
               {(chat.messages.length === 0 && !isInfoBoxVisible) || (chat.messages.length === 0 && sponsoredContent.length > 0) && SETUP_CONFIG.show_protection_badge && (
                <div className="text-center pb-2 cursor-pointer" onClick={(e) => handleProtectedClick()}>
                    <span className="inline-flex items-center gap-x-1.5 px-2.5 py-1 rounded-full  text-sm font-medium bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300
                      ">
                        <svg 
                          className="w-5 h-5" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g>
                            <path d="M11.5283 1.5999C11.7686 1.29437 12.2314 1.29437 12.4717 1.5999L14.2805 3.90051C14.4309 4.09173 14.6818 4.17325 14.9158 4.10693L17.7314 3.3089C18.1054 3.20292 18.4799 3.475 18.4946 3.86338L18.6057 6.78783C18.615 7.03089 18.77 7.24433 18.9984 7.32823L21.7453 8.33761C22.1101 8.47166 22.2532 8.91189 22.0368 9.23478L20.4078 11.666C20.2724 11.8681 20.2724 12.1319 20.4078 12.334L22.0368 14.7652C22.2532 15.0881 22.1101 15.5283 21.7453 15.6624L18.9984 16.6718C18.77 16.7557 18.615 16.9691 18.6057 17.2122L18.4946 20.1366C18.4799 20.525 18.1054 20.7971 17.7314 20.6911L14.9158 19.8931C14.6818 19.8267 14.4309 19.9083 14.2805 20.0995L12.4717 22.4001C12.2314 22.7056 11.7686 22.7056 11.5283 22.4001L9.71949 20.0995C9.56915 19.9083 9.31823 19.8267 9.08421 19.8931L6.26856 20.6911C5.89463 20.7971 5.52014 20.525 5.50539 20.1366L5.39427 17.2122C5.38503 16.9691 5.22996 16.7557 5.00164 16.6718L2.25467 15.6624C1.88986 15.5283 1.74682 15.0881 1.96317 14.7652L3.59221 12.334C3.72761 12.1319 3.72761 11.8681 3.59221 11.666L1.96317 9.23478C1.74682 8.91189 1.88986 8.47166 2.25467 8.33761L5.00165 7.32823C5.22996 7.24433 5.38503 7.03089 5.39427 6.78783L5.50539 3.86338C5.52014 3.475 5.89463 3.20292 6.26857 3.3089L9.08421 4.10693C9.31823 4.17325 9.56915 4.09173 9.71949 3.90051L11.5283 1.5999Z" stroke="#458eed" strokeWidth="2.088"></path>
                            <path d="M9 12L11 14L15 10" stroke="#458eed" strokeWidth="2.088" strokeLinecap="round" strokeLinejoin="round"></path>
                          </g>
                        </svg>
                        {t('always_protected')}
                      </span>
                  </div>
                )}
      
            <div className="chat-input-container bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div className="w-full max-w-2xl mx-auto">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  availableFiles={availableFiles}
                  availableImages={availableImages}
                  chatId={chat.id}
                  onFileProcessed={handleFileProcessed}
                  onImageProcessed={handleImageProcessed}
                  isEmpty={chat.messages.length === 0}
                  onStopStreaming={handleStopStreaming}
                  isCancellable={!!abortControllerRef.current}
                />
              </div>
            </div>
          </div>
      </div>

      <PremiumOverlay
        isOpen={showPremiumOverlay}
        type={premiumOverlayType}
        onClose={() => setShowPremiumOverlay(false)}
      />

      <ErrorOverlay
        isOpen={showErrorOverlay}
        title={errorOverlayTitle}
        text={errorOverlayText}
        showProButton={errorOverlayShowPro}
        onClose={() => setShowErrorOverlay(false)}
        onShowPro={onShowProOverlay}
        icon={errorOverlayIcon}
      />

      <SplitChatOverlay
        isOpen={showSplitOverlay}
        currentTitle={currentChatTitle}
        onClose={() => {
          setShowSplitOverlay(false);
          setSplitMessageId(null);
        }}
        onConfirm={handleConfirmSplit}
      />
    </div>
  );
}
