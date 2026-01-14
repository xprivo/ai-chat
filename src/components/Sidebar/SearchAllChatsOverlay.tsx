import React, { useState, useMemo } from 'react';
import { X, Search, MessageSquare } from 'lucide-react';
import { Chat } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface SearchAllChatsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
}

export function SearchAllChatsOverlay({
  isOpen,
  onClose,
  chats,
  onSelectChat
}: SearchAllChatsOverlayProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return chats;
    }

    const query = searchQuery.toLowerCase();
    return chats.filter(chat => {
      if (chat.title.toLowerCase().includes(query)) {
        return true;
      }

      return chat.messages.some(message =>
        message.content.toLowerCase().includes(query)
      );
    });
  }, [chats, searchQuery]);

  const getFirstUserMessage = (chat: Chat): string => {
    const firstUserMsg = chat.messages.find(m => m.role === 'user');
    return firstUserMsg?.content || '';
  };

  const getLastUserMessage = (chat: Chat): string => {
    const userMessages = chat.messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return '';
    return userMessages[userMessages.length - 1].content;
  };

  const handleChatClick = (chatId: string) => {
    onSelectChat(chatId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-[10px] py-4"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'max(10px, env(safe-area-inset-left))', // Ensures 10px or safe area
        paddingRight: 'max(10px, env(safe-area-inset-right))'
      }}
    > 
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      ></div>

     <div
  className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-[1000px] max-w-full max-h-[80vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"
  onClick={(e) => e.stopPropagation()}
>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-2">
            {t('search_all_chats') || 'Search All Chats'}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_chats_placeholder') || 'Search by title or content...'}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        </div>

        <div className="overflow-y-auto p-4">
          {filteredChats.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? (t('no_chats_found') || 'No chats found') : (t('no_chats_yet') || 'No chats yet')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredChats.map((chat) => {
                const firstMessage = getFirstUserMessage(chat);
                const lastMessage = getLastUserMessage(chat);

                return (
                  <button
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 truncate">
                      {chat.title}
                    </h3>

                    {firstMessage && (
                      <div className="mb-1.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                          {t('first_message') || 'First message:'}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {firstMessage}
                        </p>
                      </div>
                    )}

                    {lastMessage && firstMessage !== lastMessage && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                          {t('last_message') || 'Last message:'}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {lastMessage}
                        </p>
                      </div>
                    )}

                    {!firstMessage && !lastMessage && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        {t('empty_chat') || 'Empty chat'}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            {filteredChats.length === chats.length
              ? t('chats_summary', { count: chats.length })
              : t('chats_filtered_summary', { 
                  filtered: filteredChats.length, 
                  total: chats.length 
                })
            }
          </p>
        </div>
      </div>
    </div>
  );
}