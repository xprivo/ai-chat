import React from 'react';
import { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Message, ImageReference, SearchResults } from '../../types';
import { MessageBubble } from './MessageBubble';
import { ThinkingMessage } from './ThinkingMessage';
import { SearchResultsDisplay } from './SearchResultsDisplay';
import { SponsoredContent } from './SponsoredContent';
import { AssistantIcon } from '../Icons/AssistantIcon';

interface MessageListProps {
  messages: Message[];
  availableImages: Record<string, ImageReference>;
  streamingSponsoredContentTitle?: string;
  streamingSponsoredContent: any[];
  showSuggestedPremium: boolean;
  onDismissSuggestedPremium: () => void;
  onShowPremiumOverlay: () => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onRetryMessage: (messageId: string) => void;
  onSplitMessage?: (messageId: string) => void;
  isLoading: boolean;
  streamingMessage: string;
  streamingMessageId?: string | null;
  searchKeywords: string;
  searchResults: SearchResults | null;
  isSearching: boolean;
  isAssemblingResults: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({
  messages,
  availableImages,
  streamingSponsoredContentTitle = '',
  streamingSponsoredContent,
  showSuggestedPremium,
  onDismissSuggestedPremium,
  onShowPremiumOverlay,
  onEditMessage,
  onRetryMessage,
  onSplitMessage,
  isLoading,
  streamingMessage,
  streamingMessageId,
  searchKeywords,
  searchResults,
  isSearching,
  isAssemblingResults,
  messagesEndRef
}: MessageListProps) {
  const { t } = useTranslation();

  return (
     <div className="p-2 sm:p-3 w-full max-w-[700px] mx-auto">
      {messages.map((message) => (
        <div key={message.id}>
          <MessageBubble
            message={message}
            availableImages={availableImages}
            onEdit={onEditMessage}
            onRetry={onRetryMessage}
            onSplit={onSplitMessage}
            isStreaming={!!streamingMessageId && message.id === streamingMessageId}
          />
          {message.searchResults && message.role === 'user' && (
            <div className="mt-2">
              <SearchResultsDisplay searchResults={message.searchResults} />
            </div>
          )}
        </div>
      ))}
      
      {streamingSponsoredContent.length > 0 && (
        <div className="mt-4">
          <div className="mb-3">
            { streamingSponsoredContentTitle === 'ads' && (
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
                {t('sponsored_content_title')}
              </p>
            )}
          </div> 
          <SponsoredContent ads={streamingSponsoredContent} t={t} />
        </div>
      )}
      
      {showSuggestedPremium && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
        <div className="w-full px-4">
          <div className="mx-auto max-w-[500px]">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              </button>
              <div className="pr-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                    <b>{t('plus_promo_title')}</b> {t('plus_promo_description')}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href="https://www.xprivo.com/plus/learn-more"
                      className="flex-1 px-4 py-2 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-center"
                    >
                      {t('common_learnMore')}
                    </a>
                    <a
                      href="https://www.xprivo.com/plus/register"
                      className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg text-center"
                    >
                      {t('common_signUpFree')}
                    </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isSearching && (
        <div>
          <div className="block sm:hidden mb-2">
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-600 text-white">
                <AssistantIcon size={14} />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center flex-shrink-0 bg-gray-600 text-white">
              <AssistantIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 p-3 sm:p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                <svg className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  {searchKeywords
                    ? <>{t('lookingUp')} <span className="font-semibold">{searchKeywords}</span></>
                    : t('searchRelevantInfo')
                  }
                </span>
                <span className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAssemblingResults && (
        <div>
          <div className="block sm:hidden mb-2">
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-600 text-white">
                <AssistantIcon size={14} />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center flex-shrink-0 bg-gray-600 text-white">
              <AssistantIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 p-3 sm:p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50">
                <svg className="w-4 h-4 text-teal-500 dark:text-teal-400 flex-shrink-0 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm text-teal-700 dark:text-teal-300 font-medium">
                  {t('search_assembling_results')}
                </span>
                <span className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-1 rounded-full bg-teal-500 dark:bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-teal-500 dark:bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-teal-500 dark:bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && !streamingMessage && !isSearching && !isAssemblingResults && (
        <div>
          <div className="block sm:hidden mb-2">
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-600 text-white">
                <AssistantIcon size={14} />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center flex-shrink-0 bg-gray-600 text-white">
              <AssistantIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-block p-3 sm:p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent animate-shimmer"></div>
                <div className="relative z-10 break-words">
                  <span className="font-medium">{t('thinks')}</span>
                  <span className="inline-block w-6 text-left">...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}