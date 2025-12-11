import React, { useState, useEffect } from 'react';;
import { Capacitor } from '@capacitor/core';

import { Browser } from '@capacitor/browser';
import { ExternalLink, Globe, X } from 'lucide-react';
import { SearchResults } from '../../types';
import { Portal } from '../UI/Portal';
import { useTranslation } from '../../hooks/useTranslation';

interface SearchResultsDisplayProps {
  searchResults: SearchResults;
}
 
export function SearchResultsDisplay({ searchResults }: SearchResultsDisplayProps) {
  const { t } = useTranslation();
  const [showAllSources, setShowAllSources] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const platform = Capacitor.getPlatform();
      if (platform === 'ios') {
        setIsMobile(true);
      }
    }
  }, []);
  
  if (!searchResults || !searchResults.serp || searchResults.serp.length === 0) {
    return null;
  }

  const handleCardClick = async (link: string) => {
    if (isMobile) {
      try {
        await Browser.open({ url: link });
      } catch (error) {
        console.error("Failed to open browser:", error);
      }
    } else {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const formatSnippet = (snippet: string) => {
    return snippet
      .replace(/<[^>]*>/g, '')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/&/g, '&')
      .replace(/"/g, '"')
      .replace(/&#39;/g, "'");
  };

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  };

  return (
    <>
      <div className="w-full max-w-[100vw] min-w-0 overflow-hidden mb-4" style={{ maxWidth: '100vw' }}>
        <div className="w-full max-w-full min-w-0 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden" style={{ maxWidth: '100%' }}>
          <div className="w-full max-w-full min-w-0 flex items-center gap-2 mb-2 overflow-hidden">
            <Globe size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200 truncate">
              {t('hereIsWhatIFound')}
            </span>
          </div>

          <div className="w-full max-w-full min-w-0 mb-2 overflow-hidden" style={{ maxWidth: '100%' }}>
            <div className="w-full overflow-x-auto overflow-y-hidden pb-1" style={{ maxWidth: '100%' }}>
              <div className="flex gap-3" style={{ width: 'max-content' }}>
                {searchResults.serp.slice(0, 6).map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handleCardClick(result.link)}
                    className="flex-shrink-0 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all hover:shadow-md group overflow-hidden"
                    style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}
                  >
                    <div className="w-full flex items-start gap-2 mb-3 overflow-hidden">
                      {result.favicon && (
                        <img 
                          src={`data:image/png;base64,${result.favicon}`}
                          alt="" 
                          className="w-4 h-4 mt-0.5 flex-shrink-0"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      )}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight overflow-hidden" 
                            style={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              wordBreak: 'break-word',
                              maxWidth: '100%'
                            }}>
                          {result.title}
                        </h3>
                      </div>
                      <ExternalLink size={12} className="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed overflow-hidden" 
                       style={{ 
                         display: '-webkit-box',
                         WebkitLineClamp: 3,
                         WebkitBoxOrient: 'vertical',
                         wordBreak: 'break-word',
                         maxWidth: '100%'
                       }}>
                      {formatSnippet(result.snippet)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAllSources(true)}
            className="block w-fit mx-auto px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium overflow-hidden"
          >
            {t('allSources')} ({searchResults.serp.length})
          </button>
        </div>
      </div>

      {showAllSources && (
        <Portal>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4"
            onClick={() => setShowAllSources(false)}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[1000px] max-w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('searchSources')}</h2>
                <button
                  onClick={() => setShowAllSources(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 sm:p-6 overflow-auto max-h-[70vh]">
                <div className="space-y-4">
                  {searchResults.serp.map((result, index) => (
                    <div 
                      key={index} 
                      onClick={() => handleCardClick(result.link)}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group max-w-full overflow-hidden"
                    >
                      <div className="flex items-start gap-3 w-full max-w-full overflow-hidden">
                        {result.favicon && (
                          <img 
                            src={`data:image/png;base64,${result.favicon}`}
                            alt="" 
                            className="w-4 h-4 mt-1 flex-shrink-0"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                          />
                        )}
                        <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                          <div className="flex items-start justify-between gap-2 w-full max-w-full overflow-hidden">
                            <h3 className="text-blue-600 dark:text-blue-400 group-hover:underline font-medium text-sm sm:text-base leading-tight break-words max-w-full overflow-hidden" style={{ wordBreak: 'break-all' }}>
                              {result.title}
                            </h3>
                            <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-0.5" />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3 leading-relaxed break-words max-w-full overflow-hidden" style={{ wordBreak: 'break-all' }}>
                            {formatSnippet(result.snippet)}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2 break-all max-w-full overflow-hidden">
                            {formatUrl(result.link)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}