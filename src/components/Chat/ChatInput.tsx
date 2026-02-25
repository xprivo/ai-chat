import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Send, Paperclip, Loader2, X, Sparkles, Globe, Globe as GlobeOff, ChevronUp, Check, ArrowUp, Image, Zap, Cpu, Sparkle, Brain, Plus, Settings2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAISettings } from '../../hooks/useLocalStorage';
import { FileReference, ImageReference, AISettings } from '../../types';
import { Modal } from '../UI/Modal';
import { Portal } from '../UI/Portal';
import { ModelSelector } from './ModelSelector';
import { storage } from '../../utils/storage';
import { Capacitor } from '@capacitor/core';
import { AIConsentOverlay, useAIConsent } from '../UI/AIConsentOverlay';
 
// Lazy load heavy components with their dependencies
const fileProcessorImport = () => import('../FileUpload/FileProcessor').then(module => ({ default: module.FileProcessor }));
const photoUploadImport = () => import('../FileUpload/PhotoUpload').then(module => ({ default: module.PhotoUpload }));
const LazyFileProcessor = lazy(fileProcessorImport);
const LazyPhotoUpload = lazy(photoUploadImport);

const preloadComponents = () => {
  fileProcessorImport();
  photoUploadImport();
};

let pendingDroppedFile: File | null = null;
export const getPendingDroppedFile = () => {
  const file = pendingDroppedFile;
  pendingDroppedFile = null;
  return file;
};
 
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

  const {
    showConsentOverlay,
    requestConsent,
    handleAccept: handleConsentAccept,
    handleDecline: handleConsentDecline,
  } = useAIConsent();

  const [safeWebSearchActive, setSafeWebSearchActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [webToggleLabel, setWebToggleLabel] = useState<'web_on' | 'web_off' | null>(null);
  const webToggleLabelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dragCounter = useRef(0);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      const granted = await requestConsent();
      if (!granted) return;

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

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1; // Increment depth

    if (!isMobile && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
      preloadComponents();
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    dragCounter.current = 0;

    if (isMobile) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    const fileType = file.type;

    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    const documentTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/plain',
      'text/csv',
      'application/json',
      'text/markdown'
    ];

    pendingDroppedFile = file;

    if (imageTypes.includes(fileType)) {
      setShowPhotoUpload(true);
      setTimeout(() => {
        const event = new CustomEvent('fileDropped', { detail: file });
        window.dispatchEvent(event);
      }, 300);
    } else if (documentTypes.includes(fileType) || fileType.startsWith('text/')) {
      setShowFileProcessor(true);
      setTimeout(() => {
        const event = new CustomEvent('fileDropped', { detail: file });
        window.dispatchEvent(event);
      }, 300);
    }
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
        <div className="relative">
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
      
        <div
          className={`bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden w-full max-w-full p-2 sm:p-3 space-y-2 border transition-all ${
            isDragging
              ? 'border-blue-500 dark:border-blue-400 border-2 bg-blue-50 dark:bg-blue-900/10'
              : 'border-gray-200 dark:border-neutral-700'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-blue-50/90 dark:bg-blue-900/20 rounded-2xl">
              <div className="text-center">
                <div className="text-blue-600 dark:text-blue-400 text-lg font-semibold mb-1">
                  {t('chat_dropFileHere')}
                </div>
                <div className="text-blue-500 dark:text-blue-500 text-sm">
                  {t('chat_supportedFiles')}
                </div>
              </div>
            </div>
          )}
          <div className="flex items-end gap-2 w-full max-w-full">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={async () => {
                if (isMobile) {
                  const granted = await requestConsent();
                  if (!granted) {
                    textareaRef.current?.blur();
                  }
                }
              }}
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

              <button
                type="button"
                onClick={() => {
                  setShowFileMenu(!showFileMenu);
                  setShowModelDropup(false);
                  setShowRequestTypeDropup(false);
                }}
                className="flex-shrink-0 w-9 h-9 min-w-[2.25rem] min-h-[2.25rem] aspect-square p-0 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <Plus size={18} className="flex-shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowModelDropup(!showModelDropup);
                  setShowRequestTypeDropup(false);
                  setShowFileMenu(false);
                }}
                className="flex-shrink-0 w-9 h-9 min-w-[2.25rem] min-h-[2.25rem] aspect-square p-0 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <Settings2 size={18} className="flex-shrink-0" />
              </button>

              {isWebSearchEnabled && !isSafeWebSearchEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    const isCurrentlyOn = requestType === 'web_on';
                    const next: RequestType = isCurrentlyOn ? 'web_off' : 'web_on';
                    setRequestType(next);
                    storage.settings.set('requestType', next);
                    setShowRequestTypeDropup(false);
                    setWebToggleLabel(next === 'web_on' ? 'web_on' : 'web_off');
                    if (webToggleLabelTimer.current) clearTimeout(webToggleLabelTimer.current);
                    webToggleLabelTimer.current = setTimeout(() => setWebToggleLabel(null), 2000);
                  }}
                  className={`flex-shrink-0 flex items-center h-9 min-h-[2.25rem] rounded-full transition-all duration-300 overflow-hidden ${
                    requestType === 'web_on'
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60'
                      : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60'
                  } ${
                    webToggleLabel 
                      ? 'px-3 gap-1.5' 
                      : 'w-9 min-w-[2.25rem] aspect-square justify-center p-0 gap-0'
                  }`}
                >
                  <Globe size={16} className="flex-shrink-0" />
                  <span
                    className={`text-xs font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${
                      webToggleLabel ? 'max-w-[60px] opacity-100' : 'max-w-0 opacity-0'
                    }`}
                  >
                    {webToggleLabel === 'web_on' ? t('webSearch_statusActive') : t('webSearch_statusInactive')}
                  </span>
                </button> 
              )}

              {isSafeWebSearchEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    const newState = !safeWebSearchActive;
                    setSafeWebSearchActive(newState);
                    storage.settings.set('safeWebSearchActive', newState.toString());
                    setWebToggleLabel(newState ? 'web_on' : 'web_off');
                    if (webToggleLabelTimer.current) clearTimeout(webToggleLabelTimer.current);
                    webToggleLabelTimer.current = setTimeout(() => setWebToggleLabel(null), 2000);
                  }}
                  className={`flex-shrink-0 flex items-center h-9 min-h-[2.25rem] rounded-full transition-all duration-300 overflow-hidden ${
                    safeWebSearchActive
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60'
                      : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60'
                  } ${
                    webToggleLabel 
                      ? 'px-3 gap-1.5' 
                      : 'w-9 min-w-[2.25rem] aspect-square justify-center p-0 gap-0'
                  }`}
                >
                  <Globe size={16} className="flex-shrink-0" />
                  <span
                    className={`text-xs font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${
                      webToggleLabel ? 'max-w-[60px] opacity-100' : 'max-w-0 opacity-0'
                    }`}
                  >
                    {webToggleLabel === 'web_on' ? t('webSearch_statusActive') : t('webSearch_statusInactive')}
                  </span>
                </button>
              )}

            </div>
          </div>
        </div>
      
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 px-3 sm:px-4 pt-2">
          {t('ai_mistakes_check_short')}
        </p>
        </div>
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

      {showConsentOverlay && (
        <AIConsentOverlay
          onAccept={handleConsentAccept}
          onDecline={handleConsentDecline}
        />
      )}

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
