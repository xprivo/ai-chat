import React, { useState, useEffect } from 'react';
import { X, FileText, Eye, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from './Button';
import { Portal } from './Portal';
import { Textarea } from './Textarea';
import { useTranslation } from '../../hooks/useTranslation';

interface EditResponseOverlayProps {
  isOpen: boolean;
  content: string;
  onClose: () => void;
  onSave: (newContent: string) => void;
}

export function EditResponseOverlay({ isOpen, content, onClose, onSave }: EditResponseOverlayProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [activeTab, setActiveTab] = useState<'raw' | 'preview'>('raw');
  const { t } = useTranslation();
  
  useEffect(() => {
    if (isOpen) {
      setEditedContent(content);
      setActiveTab('raw');
    }
  }, [isOpen, content]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(editedContent);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[10003] flex items-center justify-center p-4 transition-all duration-300"
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
        }}
      >
       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

        <div
          className="relative w-[1000px] max-h-[85vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >

          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('edit_response_title')}
              </h2>
              <button
                onClick={onClose}
                className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('raw')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'raw'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <FileText size={16} />
                <span>{t('editor_title')}</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Eye size={16} />
                <span>{t('preview_title')}</span>
              </button>
            </div>

            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                 {t('use_markdown_formatting')} ({t('e_g_example')}, <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800/50 rounded">**{t('bold_title')}**</code>, <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800/50 rounded">_{t('italic_title')}_</code>, <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800/50 rounded">## {t('heading_title')}</code>, <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800/50 rounded"># {t('title_title')}</code>) <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800/50 rounded">&lt;center&gt;text&lt;/center&gt;</code>  {t('to_center_content')}. {t('switch_preview')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'raw' ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full min-h-[400px] p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white resize-none font-mono text-sm"
                placeholder={t('enter_markdown')}
              />
            ) : (
              <div className="prose prose-sm max-w-full dark:prose-invert overflow-hidden bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[400px]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    center: ({ children }) => (
                      <div className="text-center my-2">
                        {children}
                      </div>
                    ),
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
                          <code className="px-1.5 py-0.5 rounded text-sm font-mono break-words hyphens-auto bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                            {children}
                          </code>
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
                  {editedContent}
                </ReactMarkdown>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={onClose}
              >
                {t('Cancel')}
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                 {t('save_response')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
