import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useTranslation } from '../../hooks/useTranslation';

interface ThinkingBlockProps {
  content: string;
  isStreaming?: boolean;
}

export function ThinkingBlock({ content, isStreaming = false }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const { t, language } = useTranslation();
  
  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = 24;
      const maxCollapsedHeight = lineHeight * 3;
      setNeedsExpansion(contentRef.current.scrollHeight > maxCollapsedHeight);
    }
  }, [content]);

  useEffect(() => {
    if (isStreaming && contentRef.current && !isExpanded) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isStreaming, isExpanded]);

  return (
    <div
      className="relative mb-4 rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-50 dark:opacity-30"
        style={{
          background: 'linear-gradient(135deg, rgba(147,197,253,0.15) 0%, rgba(196,181,253,0.15) 50%, rgba(251,207,232,0.15) 100%)'
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 dark:border-gray-700/30">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Brain size={16} className="text-gray-600 dark:text-gray-300" />
              {isStreaming && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
             {isStreaming ? t('thinking_wait') : t('thinking_process')}
            </span>
          </div>

          {needsExpansion && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
              <span>{isExpanded ? t('collapse_close') : t('expand_open')}</span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          )}
        </div>

        <div className="relative">
          {!isExpanded && needsExpansion && (
            <>
              <div
                className="absolute top-0 left-0 right-0 h-4 z-20 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%)'
                }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-4 z-20 pointer-events-none dark:block hidden"
                style={{
                  background: 'linear-gradient(to bottom, rgba(30,30,30,0.5) 0%, transparent 100%)'
                }}
              />
            </>
          )}

          <div
            ref={contentRef}
            className={`px-4 py-3 text-sm text-gray-600 dark:text-gray-300 leading-6 overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-[60vh] overflow-y-auto' : ''
            }`}
            style={{
              maxHeight: isExpanded ? '60vh' : '72px',
            }}
          >
            <div className="prose prose-sm max-w-full dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ children }) => (<p className="mb-2 break-words hyphens-auto leading-relaxed whitespace-pre-wrap">{children}</p>),
                  strong: ({ children }) => (<strong className="font-semibold">{children}</strong>),
                  em: ({ children }) => (<em className="italic">{children}</em>),
                  ul: ({ children }) => (<ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>),
                  ol: ({ children }) => (<ol className="list-decimal list-inside ml-4 mb-2 space-y-1">{children}</ol>),
                  li: ({ children }) => (<li className="break-words hyphens-auto">{children}</li>),
                  code: ({ inline, children }) => {
                    if (inline) {
                      return (
                        <code className="px-1.5 py-0.5 rounded text-sm font-mono break-words hyphens-auto bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">{children}</code>
                      );
                    }
                    return <code className="font-mono">{children}</code>;
                  },
                  h1: ({ children }) => (<h1 className="text-base font-bold mt-3 mb-2 break-words hyphens-auto">{children}</h1>),
                  h2: ({ children }) => (<h2 className="text-sm font-semibold mt-2 mb-1 break-words hyphens-auto">{children}</h2>),
                  h3: ({ children }) => (<h3 className="text-sm font-semibold mt-2 mb-1 break-words hyphens-auto">{children}</h3>),
                  blockquote: ({ children }) => (<blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2 italic break-words hyphens-auto">{children}</blockquote>),
                  a: ({ href, children }) => (<a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-words">{children}</a>),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>

          {!isExpanded && needsExpansion && (
            <>
              <div
                className="absolute bottom-0 left-0 right-0 h-8 z-20 pointer-events-none dark:hidden"
                style={{
                  background: 'linear-gradient(to top, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
                }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-8 z-20 pointer-events-none hidden dark:block"
                style={{
                  background: 'linear-gradient(to top, rgba(30,30,30,0.8) 0%, rgba(30,30,30,0.4) 50%, transparent 100%)'
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
