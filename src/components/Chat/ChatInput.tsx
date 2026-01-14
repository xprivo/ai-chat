import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Send, Paperclip, Loader2, X, Sparkles, Globe, Globe as GlobeOff, ChevronUp, Check, ArrowUp, Image, Zap, Cpu, Sparkle, Brain } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAISettings } from '../../hooks/useLocalStorage';
import { FileReference, ImageReference, AISettings } from '../../types';
import { Modal } from '../UI/Modal';
import { Portal } from '../UI/Portal';
import { ModelSelector } from './ModelSelector';
import { storage } from '../../utils/storage';
import { Capacitor } from '@capacitor/core';
 
// Lazy load heavy components with their dependencies
const LazyFileProcessor = lazy(() => import('../FileUpload/FileProcessor').then(module => ({ default: module.FileProcessor })));
const LazyPhotoUpload = lazy(() => import('../FileUpload/PhotoUpload').then(module => ({ default: module.PhotoUpload })));
 
interface ChatInputProps {
  onSendMessage: (content: string, files: FileReference[], images: ImageReference[], model: string, requestType: string) => void;
  isLoading: boolean;
  availableFiles: Record<string, FileReference>;
  availableImages: Record<string, ImageReference>;
  chatId: string;
  onFileProcessed: (file: FileReference) => void;
  onImageProcessed: (image: ImageReference) => void;
  isEmpty?: boolean;

  onStopStreaming: () => void; 
  isCancellable: boolean; 
}
type RequestType = 'auto' | 'web_off' | 'web_on';

export function ChatInput({ 
  onSendMessage, 
  isLoading, 
  availableFiles, 
  availableImages,
  chatId,  
  onFileProcessed,
  onImageProcessed,
  isEmpty,
  onStopStreaming, 
  isCancellable, 
}: ChatInputProps) {
  const { t } = useTranslation();
  const { aiSettings, saveAISettings } = useAISettings();
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileReference[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImageReference[]>([]);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showFileProcessor, setShowFileProcessor] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showModelDropup, setShowModelDropup] = useState(false);
  const [showRequestTypeDropup, setShowRequestTypeDropup] = useState(false);
  const [showUpgradeOverlay, setShowUpgradeOverlay] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hasProKey, setHasProKey] = useState(false);

  const [requestType, setRequestType] = useState<RequestType>('auto');

  const [safeWebSearchActive, setSafeWebSearchActive] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setIsMobile(true);
    }
  }, []);

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
    const loadSettings = async () => {
      try {
        const storedRequestType = await storage.settings.get('requestType');
        if (storedRequestType) {
          setRequestType(storedRequestType as RequestType);
        }

        const storedSafeWebSearch = await storage.settings.get('safeWebSearchActive');
        if (storedSafeWebSearch) {
          setSafeWebSearchActive(storedSafeWebSearch === 'true');
        }
      } catch (error) {
        console.error('Error loading chat input settings:', error);
      }
    };

    loadSettings();
  }, []);


  const selectedModelEndpoint = aiSettings.endpoints.find(endpoint =>
    endpoint.models.includes(aiSettings.selectedModel)
  );

  const isWebSearchEnabled = selectedModelEndpoint?.enableWebSearch || false;
  const isSafeWebSearchEnabled = selectedModelEndpoint?.enableSafeWebSearch || false;

  const handleModelChange = (model: string) => {
    const newModelEndpoint = aiSettings.endpoints.find(ep => ep.models.includes(model));
    const metadata = newModelEndpoint?.modelMetadata?.[model];

    if (metadata?.ispremium && !hasProKey) {
      setShowUpgradeOverlay(true);
      setShowModelDropup(false);
      return;
    }

    const newWebSearchEnabled = newModelEndpoint?.enableWebSearch || false;
    const newSafeWebSearchEnabled = newModelEndpoint?.enableSafeWebSearch || false;

    if (!newWebSearchEnabled && !newSafeWebSearchEnabled) {
      setRequestType('auto');
      storage.settings.set('requestType', 'auto');
    }

    const updatedSettings = {
      ...aiSettings,
      selectedModel: model
    };
    saveAISettings(updatedSettings);
    setShowModelDropup(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      const finalRequestType = isWebSearchEnabled && !isSafeWebSearchEnabled ? requestType : 'auto';
      
      onSendMessage(message, selectedFiles, selectedImages, aiSettings.selectedModel, finalRequestType);
      
      setMessage('');
      setSelectedFiles([]);
      setSelectedImages([]);
    }
  };
  
  // Auto-focus when assistant finishes responding - sometimes convenient, but not now
  // useEffect(() => {
  //   if (!isLoading && textareaRef.current && !isEmpty) {
  //     textareaRef.current.focus();
  //   }
  // }, [isLoading]);
  
  /* //was used in early version - deprecated
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        handleSubmit(e);
      }
    }
    
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowModelDropup(false);
      setShowRequestTypeDropup(false);
    }
  };*/

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {

      if (isMobile) {
        //On mobile, "Enter" should *always* be a new line.
        return;
      }

      if (e.shiftKey) {
        // Desktop: Shift+Enter = new line.
        // Let the default behavior happen.
        return;
      }
      
      e.preventDefault();
      if (!isLoading) {
        handleSubmit(e);
      }
    }

    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowModelDropup(false);
      setShowRequestTypeDropup(false);
    }
  };
  
  const handleRequestTypeChange = (type: RequestType) => {
    setRequestType(type);
    storage.settings.set('requestType', type);
    setShowRequestTypeDropup(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    
    setMessage(value);
    setCursorPosition(position);

    const beforeCursor = value.substring(0, position);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const afterAt = beforeCursor.substring(atIndex + 1);
      
      if (afterAt.includes(' ')) {
        setShowSuggestions(false);
      } else {
        setShowSuggestions(true);
        setSuggestionFilter(afterAt);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (name: string) => {
    const beforeCursor = message.substring(0, cursorPosition);
    const afterCursor = message.substring(cursorPosition);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    const newMessage = beforeCursor.substring(0, atIndex) + `@${name} ` + afterCursor;
    setMessage(newMessage);
    setShowSuggestions(false);
    
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = atIndex + name.length + 2;
        textareaRef.current.setSelectionRange(newPosition, newPosition);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const addMentionToInput = (name: string) => {
    const newMessage = message + (message && !message.endsWith(' ') ? ' ' : '') + `@${name} `;
    setMessage(newMessage);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newMessage.length, newMessage.length);
      }
    }, 0);
  };

  const allItems = [
    ...Object.values(availableFiles).map(file => ({ ...file, itemType: 'file' as const })),
    ...Object.values(availableImages).map(image => ({ ...image, itemType: 'image' as const }))
  ];

  const filteredItems = allItems.filter(item =>
    item.name.toLowerCase().includes(suggestionFilter.toLowerCase())
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  useEffect(() => {
    (window as any).addMentionToInput = addMentionToInput;
    return () => {
      delete (window as any).addMentionToInput;
    };
  }, [message]);

  const existingFileNames = Object.keys(availableFiles);
  const existingImageNames = Object.keys(availableImages);

  const handleFileProcessed = (file: FileReference) => {
    onFileProcessed(file);
    setShowFileProcessor(false);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  const handleImageProcessed = (image: ImageReference) => {
    onImageProcessed(image);
    setShowPhotoUpload(false);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  const getRequestTypeIcon = (type: RequestType) => {
    switch (type) {
      case 'auto':
        return <Sparkles size={16} />;
      case 'web_on':
        return <Globe size={16} />;
      case 'web_off':
        return <GlobeOff size={16} />;
    }
  };

  const getRequestTypeLabel = (type: RequestType) => {
    switch (type) {
      case 'auto':
        return t('requestType_auto');
      case 'web_on':
        return t('webSearch_statusActive');
      case 'web_off':
        return t('webSearch_statusInactive');
    }
  };
  
  const allModels = aiSettings.endpoints.flatMap(endpoint => endpoint.models);

  return (
    <>  
      <form onSubmit={handleSubmit} className="relative">
        {showSuggestions && filteredItems.length > 0 && (
          <div
            className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-32 overflow-auto max-w-full"
            style={{ zIndex: 10000 }}
          >
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => insertMention(item.name)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-neutral-700 text-sm flex items-center gap-2"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.itemType === 'file' ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                ></span>
                @{item.name}
                <span className="text-xs opacity-70 ml-auto">
                  {item.itemType === 'file' ? t('file_solo') : 'IMG'}
                </span>
              </button>
            ))}
          </div>
        )}
      
        {showModelDropup && (
          <Portal>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-[10002] flex items-center justify-center p-4"
              onClick={() => setShowModelDropup(false)}
            >
              <div
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-[800px] max-w-[90vw] max-h-[70vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('selectAIModel')}</h3>
                  <button
                    onClick={() => setShowModelDropup(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="overflow-auto max-h-[50vh]">
                  {aiSettings.endpoints.map((endpoint) => (
                    <div key={endpoint.id} className="border-b border-gray-100 dark:border-neutral-700 last:border-b-0">
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {endpoint.name}
                        </h4>
                      </div>
                      <div className="space-y-1 p-2">
                        {endpoint.models.map((model) => {
                          const metadata = endpoint.modelMetadata?.[model];
                          const isPremium = metadata?.ispremium || false;
                          const isReasoning = metadata?.reasoning || false;
                          const logoUrl = metadata?.logo_url || '';
                          const displayName = metadata?.name || model;

                          return (
                            <button
                              key={model}
                              type="button"
                              onClick={() => handleModelChange(model)}
                              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {logoUrl && (
                                  <img
                                    src={logoUrl}
                                    alt={`${displayName} logo`}
                                    className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                                  />
                                )}
                                <span className="text-sm text-gray-900 dark:text-white truncate">
                                  {displayName}
                                </span>
                                {isReasoning && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 flex-shrink-0">
                                    <Brain size={12} />
                                    {t('reasoning_model')}
                                  </span>
                                )}
                                {isPremium && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-orange-500/20 dark:text-orange-400 flex-shrink-0">
                                    <Zap size={12} />
                                    PRO
                                  </span>
                                )}
                              </div>
                              {aiSettings.selectedModel === model && (
                                <Check size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {allModels.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('configureAIModelsEndpoints')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Portal>
        )}
      
        {showRequestTypeDropup && (
          <div className="absolute bottom-full mb-1 left-0 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-xl shadow-lg py-2 min-w-32" style={{ zIndex: 10002 }}>
            {(['auto', 'web_off', 'web_on'] as RequestType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleRequestTypeChange(type)}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {getRequestTypeIcon(type)}
                  <span className="text-sm text-gray-900 dark:text-white">
                    {getRequestTypeLabel(type)}
                  </span>
                </div>
                {requestType === type && (
                  <Check size={14} className="text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))}
          </div>
        )}
      
        {showFileMenu && (
          <Portal>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-[10002] flex items-center justify-center p-4"
              onClick={() => setShowFileMenu(false)}
            >
              <div
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-[800px] max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('attachFile')}</h3>
                  <button
                    onClick={() => setShowFileMenu(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFileProcessor(true);
                      setShowFileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-neutral-700 text-sm text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-neutral-600 transition-colors"
                  >
                    <Paperclip size={20} className="text-blue-500" />
                    <div>
                      <div className="font-medium">{t('includeFile')}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('supportedFormats')}</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPhotoUpload(true);
                      setShowFileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-neutral-700 text-sm text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-neutral-600 transition-colors"
                  >
                    <Image size={20} className="text-green-500" />
                    <div>
                      <div className="font-medium">{t('includePhoto')}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('supportedImageFormats')}</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        )}
      
        <div className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden w-full max-w-full p-2 sm:p-3 space-y-2 border border-gray-200 dark:border-neutral-700">
          <div className="flex items-end gap-2 w-full max-w-full">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t('ask_a_question')}
              className="flex-1 relative min-w-0 max-w-full resize-none border-0 bg-transparent px-1 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0"
              rows={1}
            />
        
            {isCancellable ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="flex-shrink-0 w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] aspect-square flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-circle-stop-icon lucide-circle-stop"
                >
                  <circle cx="12" cy="12" r="10" />
                  <rect x="9" y="9" width="6" height="6" rx="1" />
                </svg>
              </button>
            ) : ( 
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="flex-shrink-0 w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] aspect-square flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
              > 
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowUp size={20} />}
              </button>  
            )}
          </div>
      
          <div className="flex items-center justify-between gap-1 sm:gap-2 w-full max-w-full overflow-hidden">
            <div className="flex items-center gap-1 flex-1 min-w-0 max-w-full overflow-hidden">
              
      
              {isWebSearchEnabled && !isSafeWebSearchEnabled && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestTypeDropup(!showRequestTypeDropup);
                      setShowModelDropup(false);
                      setShowFileMenu(false);
                    }}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors border border-gray-200 dark:border-neutral-600"
                  >
                    {getRequestTypeIcon(requestType)}
                    <span className="hidden sm:inline">{getRequestTypeLabel(requestType)}</span>
                    <ChevronUp
                      size={12}
                      className={`transition-transform ${showRequestTypeDropup ? 'rotate-180' : ''} hidden sm:inline`}
                    />
                  </button>
                </div>
              )}
      
              {isSafeWebSearchEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    const newState = !safeWebSearchActive;
                    setSafeWebSearchActive(newState);
      storage.settings.set('safeWebSearchActive', newState.toString());
                  }}
                  className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                    safeWebSearchActive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50'
                  }`}
                >
                  <Globe size={14} />
                  <span>{t(safeWebSearchActive ? 'webSearch_statusActive' : 'webSearch_statusInactive')}</span>
                </button>
              )}
      
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowFileMenu(!showFileMenu);
                    setShowModelDropup(false);
                    setShowRequestTypeDropup(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors border border-gray-200 dark:border-neutral-600"
                >
                  <Paperclip size={14} />
                  <ChevronUp
                    size={12}
                    className={`transition-transform ${showFileMenu ? 'rotate-180' : ''} hidden sm:inline`}
                  />
                </button>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowModelDropup(!showModelDropup);
                    setShowRequestTypeDropup(false);
                    setShowFileMenu(false);
                  }}
                  className="flex items-center gap-1 ml-1 px-2 py-1.5 text-xs bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors border border-gray-200 dark:border-neutral-600"
                >
                   <Cpu size={16} />
                  <span className="truncate" style={{ minWidth: '40px', maxWidth: '80px' }}>
                    {(() => {
                      const selectedEndpoint = aiSettings.endpoints.find(ep => ep.models.includes(aiSettings.selectedModel));
                      const metadata = selectedEndpoint?.modelMetadata?.[aiSettings.selectedModel];
                      return metadata?.name || aiSettings.selectedModel;
                    })()}
                  </span>
                  <ChevronUp
                    size={12}
                    className={`transition-transform ${showModelDropup ? 'rotate-180' : ''} hidden sm:inline`}
                  />
                </button>
              </div>
              
            </div>
          </div>
        </div>
      
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 px-3 sm:px-4 pt-2">
          {t('ai_mistakes_check_short')}
        </p>
      </form>

      {showRequestTypeDropup && (
        <Portal>
          <div
            className="fixed inset-0 z-[10001]"
            onClick={() => {
              setShowRequestTypeDropup(false);
            }}
          />
        </Portal>
      )}

      <Modal
        isOpen={showFileProcessor}
        onClose={() => setShowFileProcessor(false)}
        title={t('includeFile')}
      >
        <div className="p-4 sm:p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">{t('loadingFileProcessor')}</span>
            </div>
          }>
            <LazyFileProcessor
              onFileProcessed={handleFileProcessed}
              onClose={() => setShowFileProcessor(false)}
              existingFileNames={existingFileNames}
              chatId={chatId}
            />
          </Suspense>
        </div>
      </Modal>

      <Modal
        isOpen={showPhotoUpload}
        onClose={() => setShowPhotoUpload(false)}
        title={t('includePhoto')}
      >
        <div className="p-4 sm:p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">{t('loadingPhotoUploader')}</span>
            </div>
          }>
            <LazyPhotoUpload 
              onImageProcessed={handleImageProcessed}
              onClose={() => setShowPhotoUpload(false)}
              existingImageNames={existingImageNames}
              chatId={chatId}
            />
          </Suspense>
        </div>
      </Modal>

      {showUpgradeOverlay && (
        <Portal>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10003] flex items-center justify-center p-4"
            onClick={() => setShowUpgradeOverlay(false)}
          >
            <div
              className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-[800px] p-8 border border-gray-100 dark:border-neutral-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 transform transition-transform hover:rotate-6 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-[#d9a420] dark:to-[#bc890d]">
                  <Zap size={32} className="text-white" fill="currentColor" />
                </div>
      
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                  {t('pro_upgrade_title')}
                </h2>
      
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  {t('pro_upgrade_description')}
                </p>
      
                <button
                  onClick={() => {
                    setShowUpgradeOverlay(false);
                    window.dispatchEvent(new CustomEvent('showProOverlay'));
                  }}
                  className="w-full text-white font-bold py-3.5 px-6 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mb-4 shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 dark:from-[#d9a420] dark:to-[#bc890d]"
                >
                  {t('pro_upgrade_cta')}
                </button>
      
                <button
                  onClick={() => setShowUpgradeOverlay(false)}
                  className="text-sm text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                >
                  {t('pro_upgrade_maybe_later')}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
