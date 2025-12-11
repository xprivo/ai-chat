import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Edit2, RotateCcw, AlertCircle, Copy, Check, Info } from 'lucide-react';
import { Message, ImageReference } from '../../types';
import { FileChip } from './FileChip';
import { ImageChip } from './ImageChip';
import { Button } from '../UI/Button';
import { useTranslation } from '../../hooks/useTranslation';

interface MessageBubbleProps {
  message: Message;
  availableImages: Record<string, ImageReference>;
  onEdit: (messageId: string, newContent: string) => void;
  onRetry: (messageId: string) => void;
}

export function MessageBubble({ message, availableImages, onEdit, onRetry }: MessageBubbleProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isCopied, setIsCopied] = useState(false);

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

  const getMentionedImages = () => {
    const mentions = message.content.match(/@(\w+)/g);
    if (!mentions) return [];
    
    return mentions
      .map(mention => mention.slice(1))
      .filter(name => availableImages[name])
      .map(name => availableImages[name]);
  };

  const mentionedImages = getMentionedImages();

  const getAssistantIcon = () => {
    const customIcon = localStorage.getItem('assistantIcon');
    if (customIcon) {
      return (
        <img
          src={customIcon}
          alt="Assistant"
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            //Custom assistant icon failed to load, falling back to default
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
    <div className="w-full max-w-[100vw] min-w-0 overflow-hidden" style={{ maxWidth: '100vw' }}>
      <div className={`flex items-start gap-3 ${message.role === 'assistant' ? 'flex-col lg:flex-row' : ''}`}>

        {message.role === 'assistant' && (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-600 text-white">
            {getAssistantIcon()}
          </div>
        )}

        {/* Message content container */}
        <div className={`flex-1 min-w-0 max-w-full overflow-hidden ${message.role === 'user' ? 'ml-auto' : ''}`} style={{ maxWidth: '100%' }}>
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
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  style={{ maxWidth: '100%', width: '100%' }}
                  components={{
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        {children}
                      </thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-3 min-w-[200px] text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-3 min-w-[200px] text-sm text-gray-900 dark:text-gray-100 break-words hyphens-auto">
                        {children}
                      </td>
                    ),
                    tr: ({ children }) => (
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        {children}
                      </tr>
                    ),
                    pre: ({ children }) => (
                      <div className="overflow-x-auto my-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <pre className="p-4 text-sm text-gray-900 dark:text-gray-100 whitespace-pre">
                          {children}
                        </pre>
                      </div>
                    ),
                    code: ({ inline, children }) => {
                      if (inline) {
                        return (
                          <code className={`px-1.5 py-0.5 rounded text-sm font-mono break-words hyphens-auto ${
                            message.role === 'user'
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}>
                            {children}
                          </code>
                        );
                      }
                      return <code className="font-mono">{children}</code>;
                    },
                    h1: ({ children }) => (<h1 className="text-lg sm:text-xl font-bold mt-4 mb-3 break-words hyphens-auto">{children}</h1>),
                    h2: ({ children }) => (<h2 className="text-base sm:text-lg font-semibold mt-3 mb-2 break-words hyphens-auto">{children}</h2>),
                    h3: ({ children }) => (<h3 className="text-sm sm:text-base font-semibold mt-3 mb-2 break-words hyphens-auto">{children}</h3>),
                    //remove whitespace-pre-wrap here to remove newlines
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
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
            
            {isEditing && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    {t('promptEditInfo')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {message.files && message.files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 max-w-full">
              {message.files.map((file) => (<FileChip key={file.id} file={file} />))}
            </div>
          )}

          {message.images && message.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 max-w-full">
              {message.images.map((image) => (<ImageChip key={image.id} image={image} />))}
            </div>
          )}

          {message.role === 'user' && mentionedImages.length > 0 && (
            <div className="mt-3 space-y-2 max-w-full">
              {mentionedImages.map((image) => (
                <div key={image.id} className="flex justify-end">
                  <img
                    src={image.content}
                    alt={image.name}
                    className="max-w-32 sm:max-w-48 max-h-24 sm:max-h-32 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      const modal = document.createElement('div');
                      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                      modal.onclick = () => modal.remove();
                      
                      const img = document.createElement('img');
                      img.src = image.content;
                      img.className = 'max-w-full max-h-full rounded-lg';
                      img.onclick = (e) => e.stopPropagation();
                      
                      modal.appendChild(img);
                      document.body.appendChild(modal);
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <div className={`flex flex-wrap gap-2 mt-3 max-w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'user' && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[32px]">
                <Edit2 size={15} />
                <span className="hidden sm:inline">{t('edit')}</span>
              </button>
            )}

            {message.role === 'assistant' && !message.isError && (
              <button onClick={handleCopy} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[32px]">
                {isCopied ? <Check size={15} /> : <Copy size={15} />}
                <span className="hidden sm:inline">{isCopied ? t('copied') : t('copy')}</span>
              </button>
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
    </div>
  );
}