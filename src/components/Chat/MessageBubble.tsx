import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Bot, Edit2, RotateCcw, AlertCircle, Copy, Check, Info, Split, FileEdit, Download } from 'lucide-react';
import { Message, ImageReference } from '../../types';
import { FileChip } from './FileChip';
import { ImageChip } from './ImageChip';
import { Button } from '../UI/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { EditResponseOverlay } from '../UI/EditResponseOverlay';
import { CustomTemplateOverlay } from '../UI/CustomTemplateOverlay';
import { downloadAsPDF, downloadAsWord } from '../../utils/documentDownload';
import { ThinkingBlock } from './ThinkingBlock';

interface MessageBubbleProps {
  message: Message;
  availableImages: Record<string, ImageReference>;
  onEdit: (messageId: string, newContent: string) => void;
  onRetry: (messageId: string) => void;
  onSplit?: (messageId: string) => void;
  isStreaming?: boolean;
}

function parseThinkingContent(content: string, isStreaming: boolean): { thinking: string | null; mainContent: string } {
  if (!content.startsWith('<thought>')) {
    return { thinking: null, mainContent: content };
  }

  const endTagIndex = content.indexOf('</thought>');

  if (endTagIndex !== -1) {
    const thinking = content.slice(9, endTagIndex).trim();
    const mainContent = content.slice(endTagIndex + 10).trim();
    return { thinking, mainContent };
  }

  if (isStreaming) {
    const thinking = content.slice(9).trim();
    return { thinking, mainContent: '' };
  }

  return { thinking: null, mainContent: content };
}

export function MessageBubble({ message, availableImages, onEdit, onRetry, onSplit, isStreaming = false }: MessageBubbleProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isCopied, setIsCopied] = useState(false);
  const [showEditResponseOverlay, setShowEditResponseOverlay] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showCustomTemplateOverlay, setShowCustomTemplateOverlay] = useState(false);
  
  // Refs for positioning and click-outside detection
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const handleSaveEdit = () => {
    onEdit(message.id, editContent.trim());
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSaveEditedResponse = (newContent: string) => {
    onEdit(message.id, newContent);
  };

  const handleDownloadPDF = async () => {
    setShowDownloadMenu(false);
    try {
      await downloadAsPDF(message.content);
    } catch (error) {
      console.error('PDF download error:', error);
    }
  };

  const handleDownloadWord = async () => {
    setShowDownloadMenu(false);
    try {
      await downloadAsWord(message.content);
    } catch (error) {
      console.error('Word download error:', error);
    }
  };

  const handleCustomTemplate = () => {
    setShowDownloadMenu(false);
    setShowCustomTemplateOverlay(true);
  };

  // Logic to calculate position and handle screen collisions
  const toggleDownloadMenu = () => {
    if (!showDownloadMenu && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const menuWidth = 190; 
      const padding = 12;

      let left = rect.right + window.scrollX;
      let translateX = '-100%';

      if (rect.right - menuWidth < padding) {
        left = rect.left + window.scrollX;
        translateX = '0%';
      } else if (rect.right > viewportWidth - padding) {
        left = viewportWidth - padding + window.scrollX;
        translateX = '-100%';
      }

      const menuHeight = 130; 
      let top = rect.top + window.scrollY;
      let translateY = '-110%';

      if (rect.top < menuHeight + padding) {
        top = rect.bottom + window.scrollY;
        translateY = '10%';
      }

      setMenuStyle({
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        transform: `translate(${translateX}, ${translateY})`,
      });
    }
    setShowDownloadMenu(!showDownloadMenu);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isTriggerClick = triggerRef.current?.contains(event.target as Node);
      const isMenuClick = downloadMenuRef.current?.contains(event.target as Node);
      
      if (!isTriggerClick && !isMenuClick) {
        setShowDownloadMenu(false);
      }
    };

    if (showDownloadMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      // Close on scroll/resize as portals don't move with the trigger
      window.addEventListener('scroll', () => setShowDownloadMenu(false), { passive: true });
      window.addEventListener('resize', () => setShowDownloadMenu(false));
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', () => setShowDownloadMenu(false));
      window.removeEventListener('resize', () => setShowDownloadMenu(false));
    };
  }, [showDownloadMenu]);

  const getMentionedImages = () => {
    const mentions = message.content.match(/@(\w+)/g);
    if (!mentions) return [];
    
    return mentions
      .map(mention => mention.slice(1))
      .filter(name => availableImages[name])
      .map(name => availableImages[name]);
  };

  const mentionedImages = getMentionedImages();

  const { thinking, mainContent } = useMemo(() => {
    if (message.role !== 'assistant') {
      return { thinking: null, mainContent: message.content };
    }
    return parseThinkingContent(message.content, isStreaming);
  }, [message.content, message.role, isStreaming]);

  const getAssistantIcon = () => {
    const customIcon = localStorage.getItem('assistantIcon');
    if (customIcon) {
      return (
        <img
          src={customIcon}
          alt="Assistant"
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            localStorage.removeItem('assistantIcon');
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="m12 7 2 4H10l2-4Z"/></svg>';
          }}
        />
      );
    }
    return <Bot size={16} />;
  };

  return (
    <div className="w-full max-w-[100vw] min-w-0 overflow-visible mt-8" style={{ maxWidth: '100vw' }}>
      <div className={`flex items-start gap-3 ${message.role === 'assistant' ? 'flex-col lg:flex-row' : ''}`}>

        {message.role === 'assistant' && (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-600 text-white">
            {getAssistantIcon()}
          </div>
        )}

        <div className={`flex-1 min-w-0 max-w-full ${message.role === 'user' ? 'ml-auto' : ''}`} style={{ maxWidth: '100%' }}>
          <div className={`p-2 sm:p-3 w-full max-w-full overflow-hidden ${
            message.role === 'user'
              ? 'bg-[#efefef] dark:bg-[#212121] text-gray-900 dark:text-white rounded-2xl max-w-[85%] ml-auto'
              : message.isError  
              ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-xl'
              : 'text-gray-900 dark:text-white'
          }`} style={{ maxWidth: message.role === 'user' ? '85%' : '100%' }}>
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white resize-none text-sm"
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit}>
                    {t('save')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    {t('cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-full dark:prose-invert overflow-hidden" style={{ maxWidth: '100%' }}>
                {thinking && message.role === 'assistant' && (
                  <ThinkingBlock content={thinking} isStreaming={isStreaming && !mainContent} />
                )}
                {mainContent && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  style={{ maxWidth: '100%', width: '100%' }}
                  components={{
                    center: ({ children }) => (<div className="text-center my-2">{children}</div>),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => (<thead className="bg-gray-50 dark:bg-gray-700">{children}</thead>),
                    th: ({ children }) => (<th className="px-4 py-3 min-w-[200px] text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{children}</th>),
                    td: ({ children }) => (<td className="px-4 py-3 min-w-[200px] text-sm text-gray-900 dark:text-gray-100 break-words hyphens-auto">{children}</td>),
                    tr: ({ children }) => (<tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">{children}</tr>),
                    pre: ({ children }) => (
                      <div className="overflow-x-auto my-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <pre className="p-4 text-sm text-gray-900 dark:text-gray-100 whitespace-pre">{children}</pre>
                      </div>
                    ),
                    code: ({ inline, children }) => {
                      if (inline) {
                        return (
                          <code className={`px-1.5 py-0.5 rounded text-sm font-mono break-words hyphens-auto ${
                            message.role === 'user' ? 'bg-gray-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}>{children}</code>
                        );
                      }
                      return <code className="font-mono">{children}</code>;
                    },
                    h1: ({ children }) => (<h1 className="text-lg sm:text-xl font-bold mt-4 mb-3 break-words hyphens-auto">{children}</h1>),
                    h2: ({ children }) => (<h2 className="text-base sm:text-lg font-semibold mt-3 mb-2 break-words hyphens-auto">{children}</h2>),
                    h3: ({ children }) => (<h3 className="text-sm sm:text-base font-semibold mt-3 mb-2 break-words hyphens-auto">{children}</h3>),
                    p: ({ children }) => (<p className="mb-2 break-words hyphens-auto leading-relaxed whitespace-pre-wrap">{children}</p>),
                    ul: ({ children }) => (<ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>),
                    ol: ({ children }) => (<ol className="list-decimal list-inside ml-4 mb-2 space-y-1">{children}</ol>),
                    li: ({ children }) => (<li className="break-words hyphens-auto">{children}</li>),
                    blockquote: ({ children }) => (<blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-700 dark:text-gray-300 break-words hyphens-auto">{children}</blockquote>),
                    a: ({ href, children }) => (<a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-words">{children}</a>),
                    strong: ({ children }) => (<strong className="font-semibold">{children}</strong>),
                    em: ({ children }) => (<em className="italic">{children}</em>),
                  }}
                >
                  {mainContent}
                </ReactMarkdown>
                )}
              </div>
            )}
          </div>

          <div className={`flex flex-wrap gap-2 mt-3 max-w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'user' && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[32px]">
                <Edit2 size={15} />
                <span className="hidden sm:inline">{t('edit')}</span>
              </button>
            )}

            {message.role === 'assistant' && !message.isError && (
              <>
                <button onClick={handleCopy} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[32px]">
                  {isCopied ? <Check size={15} /> : <Copy size={15} />}
                  <span className="hidden sm:inline">{isCopied ? t('copied') : t('copy')}</span>
                </button>
                {onSplit && (
                  <button onClick={() => onSplit(message.id)} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[32px]">
                    <Split size={15} />
                    <span className="hidden sm:inline">{t('split_button')}</span>
                  </button>
                )}
                <button onClick={() => setShowEditResponseOverlay(true)} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[32px]">
                  <FileEdit size={15} />
                  <span className="hidden sm:inline">{t('edit_response')}</span>
                </button>

                <div className="relative" ref={triggerRef}>
                  <button
                    onClick={toggleDownloadMenu}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[32px]"
                  >
                    <Download size={15} />
                    <span className="hidden sm:inline">{t('download_pdf_word')}</span>
                  </button>

                  {showDownloadMenu && createPortal(
                    <div 
                      ref={downloadMenuRef}
                      style={menuStyle}
                      className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[180px]"
                    >
                      <button onClick={handleDownloadPDF} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{t('download_pdf')}</button>
                      <button onClick={handleDownloadWord} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{t('download_word')}</button>
                      <button onClick={handleCustomTemplate} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{t('custom_template')}</button>
                    </div>,
                    document.body
                  )}
                </div>
              </>
            )}

            {message.isError && (
              <div className="flex items-center gap-2 px-2 py-1 rounded bg-red-50 dark:bg-red-900/20 min-h-[32px]">
                <AlertCircle size={16} className="text-red-500" />
                <button onClick={() => onRetry(message.id)} className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
                  <RotateCcw size={12} />
                  <span className="hidden sm:inline">{t('retry')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditResponseOverlay
        isOpen={showEditResponseOverlay}
        content={message.content}
        onClose={() => setShowEditResponseOverlay(false)}
        onSave={handleSaveEditedResponse}
      />

      <CustomTemplateOverlay
        isOpen={showCustomTemplateOverlay}
        content={message.content}
        onClose={() => setShowCustomTemplateOverlay(false)}
      />
    </div>
  );
}