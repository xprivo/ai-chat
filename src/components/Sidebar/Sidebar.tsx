import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

import { Browser } from '@capacitor/browser';
import { restorePurchases } from '../../utils/revenueCatDummy';
import { Plus, X, Flame, User, Settings, Globe, Download, Upload, Sparkles, Github, Heart, Gift, ChevronRight, Sun, Moon, Monitor, Palette, Calendar, BrainCircuit, FileText, Mail, HelpCircle, Award, Smartphone, Star, Newspaper, Building2, Volume2, MessageCircleHeart } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../hooks/useTheme';
import { useDateSetting, useFiles } from '../../hooks/useLocalStorage';
import { exportChatsToFile, importChatsFromFile, mergeImportedData } from '../../utils/chatBackup';
import { Chat, Workspace, Language, Expert } from '../../types';
import { AISettingsModal } from './AISettingsModal';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import { WorkspaceModal } from './WorkspaceModal';
import { WorkspaceList } from './WorkspaceList';
import { InviteFriendsOverlay } from '../UI/InviteFriendsOverlay';
import { ExpertsListView } from '../Experts/ExpertsListView';
import { ExpertEditModal } from '../Experts/ExpertEditModal';
import { ExpertLimitOverlay } from '../UI/ExpertLimitOverlay';
import { ToneSelectionOverlay } from '../UI/ToneSelectionOverlay';
import { SETUP_CONFIG } from '../../config/setup';
import { storage } from '../../utils/storage';
import { getTonePreference, saveTonePreference } from '../../utils/toneStorage';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: Chat[];
  workspaces: Workspace[];
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onCreateWorkspace: (workspace: Omit<Workspace, 'id' | 'createdAt'>) => void;
  onNewChatInWorkspace: (workspaceId: string) => void;
  onAddChatsToWorkspace: (workspaceId: string, chatIds: string[]) => void;
  onRemoveChatsFromWorkspace: (workspaceId: string, chatIds: string[]) => void;
  onUpdateWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: (workspaceId: string) => void;
  onDeleteAllChats: () => void;
  onImportChats: (chats: Chat[], workspaces: Workspace[], files: Record<string, string>, experts?: Expert[]) => void;
  selectedChatId?: string;
  onShowProOverlay: () => void;
  experts: Expert[];
  onUpdateExperts: (experts: Expert[]) => void;
  onDeleteExpert: (expertId: string) => void;
  onNewChatWithExpert: (expertId: string) => void;
}

export function Sidebar({
  isOpen,
  onToggle,
  chats,
  workspaces,
  onNewChat,
  onSelectChat,
  onCreateWorkspace,
  onNewChatInWorkspace,
  onAddChatsToWorkspace,
  onRemoveChatsFromWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
  onDeleteAllChats,
  onImportChats,
  selectedChatId,
  experts,
  onUpdateExperts,
  onDeleteExpert,
  onNewChatWithExpert,
  onShowProOverlay
}: SidebarProps) {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { useCurrentDate, saveDateSetting } = useDateSetting();
  const { files } = useFiles();
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [showInviteFriends, setShowInviteFriends] = useState(false);
  const [showSupportOverlay, setShowSupportOverlay] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [showCreditsOverlay, setShowCreditsOverlay] = useState(false);
  const [showRateOverlay, setShowRateOverlay] = useState(false);
  const [showExpertsListView, setShowExpertsListView] = useState(false);
  const [showExpertEdit, setShowExpertEdit] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [showExpertLimitOverlay, setShowExpertLimitOverlay] = useState(false);
  const [isExpertsFromConsent, setIsExpertsFromConsent] = useState(false);
  const [showToneSelectionOverlay, setShowToneSelectionOverlay] = useState(false);
  const [selectedToneId, setSelectedToneId] = useState<string | null>(null);
  const [isSignedUp, setIsSignedUp] = useState(() => {
    switch (SETUP_CONFIG.pro_switcher) {
      case 'off':
      case 'banner':
        return true;
      case 'on':
      default:
        return false;
    }
  });
  const [chatTitles, setChatTitles] = useState<Record<string, string>>({});
  const [isIOS, setIsIOS] = useState(false);
  const [hasProKey, setHasProKey] = useState(false);
  const [showRestoreSuccess, setShowRestoreSuccess] = useState(false);
  const [isRestoringPurchase, setIsRestoringPurchase] = useState(false);
  const [isIOSBrowser, setIsIOSBrowser] = useState(false);
  
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const platform = Capacitor.getPlatform();
      if (platform === 'ios') {
        setIsIOS(true);
      }
    }
  }, []);

  useEffect(() => {
    // If iOS browser (not native app) show the "Download app"-button  
    const checkIOSBrowser = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      const isNotNativeApp = !Capacitor.isNativePlatform();
      setIsIOSBrowser(isIOSDevice && isNotNativeApp);
    };
    checkIOSBrowser();
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
    const loadTonePreference = async () => {
      const toneId = await getTonePreference();
      setSelectedToneId(toneId);
    };
    loadTonePreference();

    const handleToneChange = () => {
      loadTonePreference();
    };

    window.addEventListener('tonePreferenceChanged', handleToneChange);
    return () => window.removeEventListener('tonePreferenceChanged', handleToneChange);
  }, []);

  useEffect(() => {
    const handleShowExpertsFromConsent = () => {
      setIsExpertsFromConsent(true);
      setShowExpertsListView(true);
    };

    window.addEventListener('showExpertsFromConsent', handleShowExpertsFromConsent);
    return () => window.removeEventListener('showExpertsFromConsent', handleShowExpertsFromConsent);
  }, []);

  useEffect(() => {
    const titles = Object.fromEntries(
      chats.map(chat => [chat.id, chat.title])
    );
    setChatTitles(titles);
  }, [chats]);

  useEffect(() => {
    const handleChatTitleUpdate = (event: CustomEvent) => {
      const { chatId, title } = event.detail;
      setChatTitles(prev => ({ ...prev, [chatId]: title }));
    };
    window.addEventListener('chatTitleUpdated', handleChatTitleUpdate as EventListener);
    return () => {
      window.removeEventListener('chatTitleUpdated', handleChatTitleUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    const loadAccountStatus = async () => {
      if (SETUP_CONFIG.pro_switcher === 'off') {
        setIsSignedUp(true);
        return;
      }
      try {
        const stored = await storage.settings.get('accountStatus');
        if (stored) {
          setIsSignedUp(stored === 'pro');
        }
      } catch (error) {
        console.error('Error loading account status:', error);
      }
    };
    const handleAccountStatusChange = () => loadAccountStatus();
    window.addEventListener('accountStatusChanged', handleAccountStatusChange);
    window.addEventListener('storage', handleAccountStatusChange);
    loadAccountStatus();
    return () => {
      window.removeEventListener('accountStatusChanged', handleAccountStatusChange);
      window.removeEventListener('storage', handleAccountStatusChange);
    };
  }, []);

  const handleLinkClick = async (event: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    event.preventDefault();
    if (isIOS) {
      await Browser.open({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const regularChats = chats.filter(chat => !chat.workspaceId);

  const handleExportChats = async () => {
    try {
      await exportChatsToFile(chats, workspaces, files, experts, 'full_backup');
    } catch (error) {
      console.error('Error exporting chats:', error);
    }
  };

  const handleChatWithExpert = (expertId: string) => {
    setShowExpertsListView(false);
    setIsExpertsFromConsent(false);
    onNewChatWithExpert(expertId);
  };

  const handleCloseExpertsListView = () => {
    setShowExpertsListView(false);
    setIsExpertsFromConsent(false);
  };

  const handleEditExpert = (expert: Expert) => {
    setEditingExpert(expert);
    setShowExpertEdit(true);
  };

  const handleCreateExpert = () => {
    if (experts.length >= 40) {
      setShowExpertLimitOverlay(true);
      return;
    }
    setEditingExpert(null);
    setShowExpertEdit(true);
  };

  const handleSaveExpert = (expert: Expert) => {
    const updatedExperts = experts.map(e => e.id === expert.id ? expert : e);
    onUpdateExperts(updatedExperts);
    setShowExpertEdit(false);
  };

  const handleCreateExpertSave = (data: Omit<Expert, 'id' | 'createdAt'>) => {
    if (experts.length >= 40) {
      setShowExpertLimitOverlay(true);
      return;
    }
    const newExpert: Expert = {
      ...data,
      id: `expert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    const updatedExperts = [...experts, newExpert];
    onUpdateExperts(updatedExperts);
    setShowExpertEdit(false);
  };

  const handleImportChats = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportStatus(t('import_status_importing'));
    try {
      const result = await importChatsFromFile(file);
      if (!result.isValid) {
        setImportStatus(result.error || t('import_status_failed'));
        setTimeout(() => setImportStatus(''), 3000);
        return;
      }
      const merged = mergeImportedData(chats, workspaces, files, experts, result.chats, result.workspaces, result.files, result.experts);
      onImportChats(merged.mergedChats, merged.mergedWorkspaces, merged.mergedFiles, merged.mergedExperts);
      setImportStatus(t('import_success_status', {
        chats: merged.stats.chatsAdded,
        workspaces: merged.stats.workspacesAdded,
        files: merged.stats.filesAdded
      }));
      setShowImportSuccess(true);
      setTimeout(() => {
        setImportStatus('');
        setShowImportSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus(t('import_failed_status'));
      setTimeout(() => setImportStatus(''), 3000);
    }
    event.target.value = '';
  };
  
  const handleDeleteAllConfirm = () => {
    onDeleteAllChats();
    setShowDeleteAllConfirm(false);
  };

  const handleMyAccountClick = async () => {
    switch (SETUP_CONFIG.pro_switcher) {
      case 'off': {
        const url = SETUP_CONFIG.pro_switcher_website;
        if (isIOS) {
          await Browser.open({ url });
        } else {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
        return;
      }
      case 'banner':
        window.dispatchEvent(new CustomEvent('showPremiumOverlay', { detail: { type: 'premium_suggestion' } }));
        return;
      case 'on': {
        const newSignedUpState = !isSignedUp;
        setIsSignedUp(newSignedUpState);
        const saveAccountStatus = async () => {
          try {
            await storage.settings.set('accountStatus', newSignedUpState ? 'pro' : 'free');
          } catch (error) {
            console.error('Error saving account status:', error);
          }
        };
        saveAccountStatus();
        window.dispatchEvent(new CustomEvent('accountStatusChanged', { detail: { isSignedUp: newSignedUpState } }));
        window.dispatchEvent(new Event('storage'));
        return;
      }
    }
  };

  const customIcon = SETUP_CONFIG.menu_icon ? SETUP_CONFIG.menu_icon : null;
  
  const missionUrl = language === "en" ? "https://www.xprivo.com/mission" : `https://www.xprivo.com/mission/${language}`;
  const githubUrl = "https://github.com/xprivo/ai-chat";
  const sponsorUrl = language === "en" ? "https://www.xprivo.com/mission/#sponsor" : `https://www.xprivo.com/mission/${language}#sponsor`;
  const faqUrl = language === "en" ? "https://www.xprivo.com/mission/#faq" : `https://www.xprivo.com/mission/${language}#faq`;
  const blogUrl = language === "de" ? "https://www.xprivo.com/blog/de/" : `https://www.xprivo.com/blog/`;
  const enterpriseUrl = "https://www.xprivo.com/plus/enterprise";
  const privacyPolicyUrl = SETUP_CONFIG.privacyPolicyUrl;
  const termsOfServiceUrl = SETUP_CONFIG.termsOfServiceUrl;
  const impressumUrl = SETUP_CONFIG.imprintUrl;
  const xUrl = "https://www.xprivo.com/mobileapp/xlink";
  const instagramUrl = "https://instagram.com/xprivo_com";
  const facebookUrl = "https://facebook.com/xprivo";

  const languageOptions = (
    <>
      <option value="bg">🇧🇬 {t('languageBulgarian')}</option>
      <option value="hr">🇭🇷 {t('languageCroatian')}</option>
      <option value="cs">🇨🇿 {t('languageCzech')}</option>
      <option value="da">🇩🇰 {t('languageDanish')}</option>
      <option value="nl">🇳🇱 {t('languageDutch')}</option>
      <option value="en">🇺🇸 {t('languageEnglish')}</option>
      <option value="fr">🇫🇷 {t('languageFrench')}</option>
      <option value="de">🇩🇪 {t('languageGerman')}</option>
      <option value="el">🇬🇷 {t('languageGreek')}</option>
      <option value="it">🇮🇹 {t('languageItalian')}</option>
      <option value="pl">🇵🇱 {t('languagePolish')}</option>
      <option value="pt">🇵🇹 {t('languagePortuguese')}</option>
      <option value="sl">🇸🇮 {t('languageSlovenian')}</option>
      <option value="es">🇪🇸 {t('languageSpanish')}</option>
      <option value="sv">🇸🇪 {t('languageSwedish')}</option>
      <option value="hi">🇮🇳 {t('languageHindi')}</option>
    </>
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onToggle} />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${ isOpen ? 'translate-x-0' : '-translate-x-full' }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 5px)' }}>
            <h1 className="flex items-center text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {customIcon && (
                <img src={customIcon} alt={SETUP_CONFIG.appName + ' Logo'} className="h-6 w-6 mr-2 rounded-md object-cover" />
              )}
              <span>{SETUP_CONFIG.appName}</span>
              {hasProKey && (
                <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded bg-black dark:bg-gray-200 text-white dark:text-black">
                  PRO
                </span>
              )}
            </h1>
            <button onClick={onToggle} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={20} />
            </button>
          </div> 
     
          <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
                <button
                  onClick={onNewChat}
                  className="w-full inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-sm"
                >
                  <Plus size={14} className="mr-1.5" />
                  {t('newChat')}
                </button>

                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setShowWorkspaceModal(true)}
                    className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 text-xs"
                  >
                    <Plus size={12} className="mr-1" />
                    {t('newWorkspace')}
                  </button>
                  <button
                    onClick={() => setShowExpertsListView(true)}
                    className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 text-xs"
                  >
                    <Plus size={12} className="mr-1" />
                    {t('experts_label')}
                  </button>
                  <button
                    onClick={() => setShowDeleteAllConfirm(true)}
                    className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border px-2 sm:px-3 py-1 sm:py-1.5 text-xs text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                  >
                    <Flame
                      className="w-4 h-4 min-[450px]:w-3 min-[450px]:h-3 min-[450px]:mr-1"
                    />
                    <span className="hidden min-[450px]:inline">
                      {t('deleteAllChats')}
                    </span>
                  </button>
                </div>
          </div>
 
          <div className="flex-1 overflow-auto">
            {workspaces.length > 0 && (
              <div className="mb-4">
                <h3 className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('workspaces')}</h3>
                <WorkspaceList workspaces={workspaces} chats={chats} onSelectChat={onSelectChat} onNewChatInWorkspace={onNewChatInWorkspace} onAddChatsToWorkspace={onAddChatsToWorkspace} onRemoveChatsFromWorkspace={onRemoveChatsFromWorkspace} onUpdateWorkspace={onUpdateWorkspace} onDeleteWorkspace={onDeleteWorkspace} selectedChatId={selectedChatId} />
              </div>
            )}
            <div className="px-3 sm:px-4">
              {regularChats.length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 py-2">{t('noChatsYet')}</p>
              ) : (
                <div className="space-y-1">
                  {regularChats.map((chat) => (
                    <button key={chat.id} onClick={() => onSelectChat(chat.id)} className={`w-full text-left px-2 py-2 sm:py-1 rounded text-xs sm:text-sm truncate transition-colors ${ selectedChatId === chat.id ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' }`}>
                      {chatTitles[chat.id] || chat.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
  
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={onShowProOverlay}
                  className="flex-1 max-w-[120px] sm:max-w-none flex items-center justify-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-[#d9a420] dark:to-[#bc890d] text-white shadow-sm hover:shadow-md hover:scale-[1.02] whitespace-nowrap"
                >
                  <Sparkles size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  PRO
                </button>
                <button
                  onClick={handleMyAccountClick}
                  className="flex-1 max-w-[90px] sm:max-w-[100px] flex items-center justify-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-[#d9a420]/10 dark:text-[#d9a420] dark:border dark:border-[#d9a420]/20 dark:hover:bg-[#d9a420]/20 whitespace-nowrap"
                >
                  {!isIOS && <User size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />}
                  PLUS+
                </button>
              </div>

              {!isIOS ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="relative" style={{ flexBasis: '100px' }}>
                      <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="w-full px-2 py-1.5 sm:py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer" style={{ fontSize: '11px' }}>
                        {languageOptions}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    <button onClick={() => setShowSettings(true)} className="relative flex items-center gap-1.5 px-2 py-1.5 sm:py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap" title={t('settings')}>
                      <Settings size={18} />
                      <span>{t('settings')}</span>
                      {selectedToneId && selectedToneId !== 'standard' && (
                        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-xs font-semibold text-white bg-red-500 rounded-full">
                          1
                        </span>
                      )}
                    </button>
                  </div> 
                  <div className="pt-2 pb-0 sm:pb-0 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <a href={missionUrl} onClick={(e) => handleLinkClick(e, missionUrl)} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"><Globe size={14} /><span>{t('footer_ourMission')}</span></a>
                      <a href={githubUrl} onClick={(e) => handleLinkClick(e, githubUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"><Github size={14} /><span>{t('footer_openSource')}</span></a>
                      <a href={sponsorUrl} onClick={(e) => handleLinkClick(e, sponsorUrl)} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"><Heart size={14} /><span>{t('footer_sponsor')}</span></a>
                      {SETUP_CONFIG.invitation === 'on' && (<button onClick={() => setShowInviteFriends(true)} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"><Gift size={14} /><span>{t('footer_invite')}</span></button>)}
                      <div className="flex items-center gap-[15px]">
                        <a href={xUrl} onClick={(e) => handleLinkClick(e, xUrl)} target="_blank" rel="noopener noreferrer" aria-label="X"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-label="X logo"><path d="M12.6.75h2.45l-5.36 6.14L16 15.25h-4.94l-3.87-5.07-4.42 5.07H.32l5.73-6.57L0 .75h5.06l3.49 4.63L12.6.75Zm-.86 13.03h1.36L4.32 2.15H2.87z" /></svg></a>
                        {/*<a href={instagramUrl} onClick={(e) => handleLinkClick(e, instagramUrl)} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-label="Instagram logo"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/></svg></a>*/}
                        {/*<a href={facebookUrl} onClick={(e) => handleLinkClick(e, facebookUrl)} target="_blank" rel="noopener noreferrer" aria-label="Visit my Facebook profile"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-label="Facebook logo"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/></svg></a>*/}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="pt-2 space-y-3">
                  <div className="bg-gray-100/50 dark:bg-gray-800/50 rounded-xl">
                    <div className="relative">
                      <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label={t('change_language')}>
                        {languageOptions}
                      </select>
                      <div className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white pointer-events-none rounded-t-xl">
                        <div className="flex items-center gap-3">
                          <Globe size={20} className="text-gray-500 dark:text-gray-400" />
                          <span>{t('language')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">{language.toUpperCase()}</span>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-700/50 ml-12" />
                    <button onClick={() => setShowSettings(true)} className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-b-xl">
                      <div className="flex items-center gap-3">
                        <Settings size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('settings')}</span>
                        {selectedToneId && selectedToneId !== 'standard' && (
                          <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                            1
                          </span>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <WorkspaceModal isOpen={showWorkspaceModal} onClose={() => setShowWorkspaceModal(false)} onCreateWorkspace={onCreateWorkspace} experts={experts} onUpdateExperts={onUpdateExperts} onDeleteExpert={onDeleteExpert} />
      
      <Modal isOpen={showDeleteAllConfirm} onClose={() => setShowDeleteAllConfirm(false)} title={t('deleteAllChats')}>
        <div className="space-y-4 px-4 py-4">
          <p className="text-gray-700 dark:text-gray-300">{t('warningDeleteAllChats')}</p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteAllConfirm(false)}>{t('no')}</Button>
            <Button onClick={handleDeleteAllConfirm} className="bg-red-600 hover:bg-red-700">{t('yes')}</Button>
          </div>
        </div>
      </Modal>

      {showSettings && (
        !isIOS ? (
          // --- DESKTOP SETTINGS MODAL ---
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 sm:p-6" 
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              paddingLeft: 'env(safe-area-inset-left)',
              paddingRight: 'env(safe-area-inset-right)'
            }}
            onClick={() => setShowSettings(false)}
          >
            <div 
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-[800px] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 max-h-[85dvh] sm:max-h-[90dvh]" 
              style={{ 
                maxHeight: 'calc(100dvh - 3rem)',
              }} 
              onClick={(e) => e.stopPropagation()}
            >
              
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-md sm:text-lg font-semibold text-gray-900 dark:text-white">{t('settings')}</h2>
                
                <button onClick={() => setShowSettings(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Close settings"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">

              {isIOSBrowser && (
                  <a href="https://www.xprivo.com/mobileapp/appstore" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                    <Smartphone size={16} />
                    {t('sidebar_download_ios_app')}
                  </a>
                )} 
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('themeMode')}</label>
                  <div className="flex flex-wrap gap-2 justify-start">
                    <button onClick={() => setTheme('light')} className={`px-4 py-2 text-sm rounded-lg border transition-colors ${ theme === 'light' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600' }`}>{t('lightMode')}</button>
                    <button onClick={() => setTheme('dark')} className={`px-4 py-2 text-sm rounded-lg border transition-colors ${ theme === 'dark' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600' }`}>{t('darkMode')}</button>
                    <button onClick={() => setTheme('system')} className={`px-4 py-2 text-sm rounded-lg border transition-colors ${ theme === 'system' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600' }`}>{t('systemMode')}</button>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <input type="checkbox" checked={useCurrentDate} onChange={(e) => saveDateSetting(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('useCurrentDate')}</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('de-DE')}</div>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('aiSettingsLabel')}</label>
                  <div className="flex flex-wrap gap-2">
                  <button onClick={() => { setShowSettings(false); setShowAISettings(true); }} className="inline-flex items-center px-4 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">{t('configureAIModelsEndpointsButton')}</button>
                    <button onClick={() => { setShowSettings(false); setShowToneSelectionOverlay(true); }} className="relative inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <MessageCircleHeart size={16} />
                      {t('response_style')}
                      {selectedToneId && selectedToneId !== 'standard' && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                          1
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('importExportChats')}</label>
                  <div className="space-y-2">
                    <div className='flex flex-wrap gap-2'>
                      <button onClick={handleExportChats} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"><Download size={16} />{t('downloadAllChats')}</button>
                      <div className="relative">
                        <input type="file" accept=".txt" onChange={handleImportChats} className="hidden" id="import-chats" />
                        <label htmlFor="import-chats" className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"><Upload size={16} />{t('uploadChats')}</label>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('importExportDescription')}</p>
                    {importStatus && (<div className={`text-xs p-2 rounded ${ showImportSuccess ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' }`}>{importStatus}</div>)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings_support')}</label>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => { setShowSettings(false); setShowSupportOverlay(true); }} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <Mail size={16} />
                      {t('settings_contact')}
                    </button>
                     <a href={faqUrl} onClick={(e) => handleLinkClick(e, faqUrl)} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <HelpCircle size={16} />
                      {t('settings_faq')}
                    </a>
                    <a href={blogUrl} onClick={(e) => handleLinkClick(e, blogUrl)} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <Newspaper size={16} />
                      {t('blog')}
                    </a>
                    { SETUP_CONFIG.enterprise_button && (
                    <a href={enterpriseUrl} onClick={(e) => handleLinkClick(e, enterpriseUrl)} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <Building2 size={16} />
                      {t('for_enterprise')}
                    </a>
                    )}
                    <a href={xUrl} onClick={(e) => handleLinkClick(e, xUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-label="X logo"><path d="M12.6.75h2.45l-5.36 6.14L16 15.25h-4.94l-3.87-5.07-4.42 5.07H.32l5.73-6.57L0 .75h5.06l3.49 4.63L12.6.75Zm-.86 13.03h1.36L4.32 2.15H2.87z" /></svg> {t('follow_x')} 
                    </a>
                  </div>
                </div>
           
                <div className="w-full text-center mt-2">
                  <span className="text-xs text-gray-400">AGPL-3.0 - {SETUP_CONFIG.appVersion}</span><br/>
                  <span onClick={() => { setShowSettings(false); setShowCreditsOverlay(true); }} className="text-xs text-gray-400 cursor-pointer">{t('sidebar_sources')}</span>
                </div>
              </div>
              <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1">
                  <a href={privacyPolicyUrl} onClick={(e) => handleLinkClick(e, privacyPolicyUrl)} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">{t('common_privacyPolicy')}</a>
                  <a href={termsOfServiceUrl} onClick={(e) => handleLinkClick(e, termsOfServiceUrl)} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">{t('common_termsOfService')}</a>
                  {language === 'de' && (<a href={impressumUrl} onClick={(e) => handleLinkClick(e, impressumUrl)} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">{t('footer_imprint')}</a>)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // --- IOS SETTINGS SCREEN ---
          <div className="fixed inset-0 z-50 bg-gray-100 dark:bg-gray-900 animate-slide-in-up">
            <div className="flex flex-col h-full">
              <div className="flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                <div className="flex items-center justify-between h-14 px-4">
                  <div className="w-14" />
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('settings')}</h2>
                  <div className="w-14 flex justify-end">
                    <button onClick={() => setShowSettings(false)} className="text-blue-500 hover:text-blue-600 text-sm font-semibold">{t('modal_done')}</button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
                <div className="space-y-1">
                  <p className="px-3 text-xs text-gray-500 dark:text-gray-400 uppercase">{t('appearance')}</p>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm">
                        <Palette size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('themeMode')}</span>
                      </div>
                      <div className="p-1 bg-gray-200 dark:bg-gray-700 rounded-lg flex">
                        <button onClick={() => setTheme('light')} className={`flex justify-center items-center px-2 py-1 text-xs rounded-md transition-colors ${theme === 'light' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}><Sun size={14} /></button>
                        <button onClick={() => setTheme('dark')} className={`flex justify-center items-center px-2 py-1 text-xs rounded-md transition-colors ${theme === 'dark' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}><Moon size={14} /></button>
                        <button onClick={() => setTheme('system')} className={`flex justify-center items-center px-2 py-1 text-xs rounded-md transition-colors ${theme === 'system' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}><Monitor size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="px-3 text-xs text-gray-500 dark:text-gray-400 uppercase">{t('settings_chat_settings')}</p>
                  <div className="bg-white dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('useCurrentDate')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{new Date().toLocaleDateString()}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={useCurrentDate} onChange={(e) => saveDateSetting(e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500" />
                        </label>
                      </div>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-700/50 ml-12" />
                    <button onClick={() => { setShowSettings(false); setShowAISettings(true); }} className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-b-xl">
                      <div className="flex items-center gap-3">
                        <BrainCircuit size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('aiSettingsLabel')}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                     <div className="h-px bg-gray-200 dark:bg-gray-700/50 ml-12" />
                    <button onClick={() => { setShowSettings(false); setShowToneSelectionOverlay(true); }} className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-b-xl">
                      <div className="flex items-center gap-3">
                        <MessageCircleHeart size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('response_style')}</span> {selectedToneId && selectedToneId !== 'standard' && (
                        <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                          1
                        </span>
                      )}
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="px-3 text-xs text-gray-500 dark:text-gray-400 uppercase">{t('settings_dataManagement')}</p>
                  <div className="bg-white dark:bg-gray-800 rounded-xl">
                    <button onClick={handleExportChats} className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-t-xl">
                      <div className="flex items-center gap-3">
                        <Download size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('downloadAllChats')}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                    <div className="h-px bg-gray-200 dark:bg-gray-700/50 ml-12" />
                    <label htmlFor="import-chats-ios" className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-b-xl cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Upload size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('uploadChats')}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </label>
                    <input type="file" accept=".txt" onChange={handleImportChats} className="hidden" id="import-chats-ios" />
                  </div>
                   {importStatus && (<p className={`mt-2 text-xs text-center p-2 rounded ${ showImportSuccess ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' }`}>{importStatus}</p>)}
                </div>
                
                <div className="space-y-1">
                  <p className="px-3 text-xs text-gray-500 dark:text-gray-400 uppercase">{t('settings_support')}</p>
                  <div className="bg-white dark:bg-gray-800 rounded-xl">
                    <button onClick={() => { setShowSettings(false); onShowProOverlay(); }} className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-t-xl">
                      <div className="flex items-center gap-3">
                        <User size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('settings_myAccount')}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                    <div className="h-px bg-gray-200 dark:bg-gray-700/50 ml-12" />
                    <button
                      onClick={async () => {
                        try {
                          setIsRestoringPurchase(true);
                          const result = await restorePurchases();
                           alert(t('purchase_restore_success'));
                          if (result.success && result.customerInfo) {
                            const appUserID = result.customerInfo.originalAppUserId;

                            if (appUserID) {
                              setShowRestoreSuccess(true);

                              await new Promise(resolve => setTimeout(resolve, 2000));

                              const checkSubscriberResponse = await fetch('https://www.xprivo.com/auth/checknewsubscriber', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ subscriber_id: appUserID })
                              });

                              if (checkSubscriberResponse.ok) {
                                const checkSubscriberData = await checkSubscriberResponse.json();
                                const proKey = checkSubscriberData.pro_key;

                                if (proKey) {
                                  localStorage.setItem('pro_key', proKey);
                                  window.dispatchEvent(new Event('storage'));
                                }
                              }

                              setTimeout(() => {
                                setShowRestoreSuccess(false);
                                setIsRestoringPurchase(false);
                              }, 2000);
                            }
                          } else {
                            setIsRestoringPurchase(false);
                          }
                        } catch (error) {
                          console.error('Restore purchases error:', error);
                          setIsRestoringPurchase(false);
                        }
                      }}
                      className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <User size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('settings_restore')}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                    <div className="h-px bg-gray-200 dark:bg-gray-700/50 ml-12" />
                    <button onClick={() => setShowSupportOverlay(true)} className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center gap-3">
                        <Mail size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('settings_contact')}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                    <div className="h-px bg-gray-200 dark:bg-gray-700/50 ml-12" />
                    <a href={faqUrl} onClick={(e) => handleLinkClick(e, faqUrl)} className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-b-xl">
                      <div className="flex items-center gap-3">
                        <HelpCircle size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('settings_faq')}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </a>

                    <div className="h-px bg-gray-200 dark:bg-gray-700/50 ml-12" />
                    <a href={blogUrl} onClick={(e) => handleLinkClick(e, blogUrl)} className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-b-xl">
                      <div className="flex items-center gap-3">
                        <Newspaper size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>Blog</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </a>

                    <div className="h-px bg-gray-200 dark:bg-gray-700/50 ml-12" />
                    <button onClick={() => setShowRateOverlay(true)} className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center gap-3">
                        <Star size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('sidebar_review_prompt')}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="px-3 text-xs text-gray-500 dark:text-gray-400 uppercase">{t('settings_about')}</p>
                  <div className="bg-white dark:bg-gray-800 rounded-xl">
                    <a href={missionUrl} onClick={(e) => handleLinkClick(e, missionUrl)} className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-t-xl">
                      <div className="flex items-center gap-3">
                        <Globe size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('footer_ourMission')}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </a>
                    <div className="h-px bg-gray-200 dark:bg-gray-700/50 ml-12" />
                    <a href={githubUrl} onClick={(e) => handleLinkClick(e, githubUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center gap-3">
                        <Github size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('footer_openSource')}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </a>
                    <div className="h-px bg-gray-200 dark:bg-gray-700/50 ml-12" />
                    <a href={sponsorUrl} onClick={(e) => handleLinkClick(e, sponsorUrl)} className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center gap-3">
                        <Heart size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('footer_sponsor')}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </a>
                    <div className="h-px bg-gray-200 dark:bg-gray-700/50 ml-12" />
                    <a href={privacyPolicyUrl} onClick={(e) => handleLinkClick(e, privacyPolicyUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('common_privacyPolicy')}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </a>
                    <div className="h-px bg-gray-200 dark:bg-gray-700/50 ml-12" />
                    <a href={termsOfServiceUrl} onClick={(e) => handleLinkClick(e, termsOfServiceUrl)} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50 ${language !== 'de' && 'rounded-b-xl'}`}>
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('common_termsOfService')}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </a>
                    {language === 'de' && (
                      <>
                        <div className="h-px bg-gray-200 dark:bg-gray-700/50 ml-12" />
                        <a href={impressumUrl} onClick={(e) => handleLinkClick(e, impressumUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-b-xl">
                          <div className="flex items-center gap-3">
                            <FileText size={20} className="text-gray-500 dark:text-gray-400" />
                            <span>{t('footer_imprint')}</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </a>
                      </>
                    )}
                    <div className="h-px bg-gray-200 dark:bg-gray-700/50 ml-12" />
                    <button onClick={() => setShowCreditsOverlay(true)} className="flex items-center justify-between w-full p-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-b-xl">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-gray-500 dark:text-gray-400" />
                        <span>{t('sidebar_sources')}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  </div>
                  <div className="text-center mt-4 px-3">
                    <span className="text-xs text-gray-400">AGPL-3.0 - {SETUP_CONFIG.appVersion}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {showSupportOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4" onClick={() => setShowSupportOverlay(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-[800px] p-6 text-center space-y-4 animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings_contact')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
             {t('settings_contact_text')}
            </p>
            <a href={`mailto:${SETUP_CONFIG.contactEmail || 'froen@xprivo.com'}`} className="block text-sm font-medium text-blue-500 hover:underline">
              {SETUP_CONFIG.contactEmail || 'froen@xprivo.com'}
            </a>
            <Button onClick={() => setShowSupportOverlay(false)} className="mt-4 w-full">
              {t('modal_done')}
            </Button>
          </div>
        </div>
      )}

      <AISettingsModal isOpen={showAISettings} onClose={() => setShowAISettings(false)} />
      <InviteFriendsOverlay isOpen={showInviteFriends} onClose={() => setShowInviteFriends(false)} />

      {showCreditsOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4 sm:p-6" 
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)'
          }}
          onClick={() => setShowCreditsOverlay(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-[800px] flex flex-col overflow-hidden animate-slide-in-up max-h-[85dvh] sm:max-h-[90dvh]" 
            style={{ 
              maxHeight: 'calc(100dvh - 3rem)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 p-6 pb-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mt-4">Open Source Credits</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-2">
                This project is built on amazing open-source libraries:
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-3 text-left">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">React & React-DOM (v18.3.1) - MIT License</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Copyright © Meta Platforms, Inc.</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">PDF.js (v5.4) - Apache-2.0</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Copyright © Mozilla Foundation</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">Exceljs (v4.4.0) - MIT License</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Spreadsheet data toolkit - Guyon Roche</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">Mammoth (v1.6.0) - BSD-2-Clause</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Convert .docx to HTML</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">Lucide React (v0.344.0) - ISC License</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Beautiful icon toolkit</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">localForage (v1.10.0) - Apache-2.0</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Copyright © Mozilla Contributors</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">heic2any (v0.0.4) - MIT License</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">HEIC/HEIF image conversion</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">react-markdown (v10.1.0) - MIT License</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Markdown rendering for React</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">remark-gfm (v4.0.1) - MIT License</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">GitHub Flavored Markdown support</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">Capacitor (v7.x) - MIT License</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Copyright © Ionic - Cross-platform runtime</p>
                </div>
              </div>
            </div>
        
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Button onClick={() => setShowCreditsOverlay(false)} className="w-full">
                {t('modal_done')}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {showRateOverlay && (
       <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4" onClick={() => setShowRateOverlay(false)}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-[800px] p-6 text-center space-y-4 animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('sidebar_difference')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('sidebar_difference_text')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 items-center pb-2">{t('sidebar_review')}:</p>
            <a
              href="itms-apps://itunes.apple.com/app/id6753941516?action=write-review" 
              target="_blank"
              rel="noopener noreferrer"
              className="items-center gap-2 px-6 py-3 text-blue font-medium break-words hyphens-auto"
            >
              https://apps.apple.com/us/app/xprivo-private-ai-chat/id6753941516
            </a>
            <Button onClick={() => setShowRateOverlay(false)} variant="outline" className="mt-4 w-full">
              {t('modal_done')}
            </Button>
          </div>
        </div>
      )}
      <ExpertsListView
        isOpen={showExpertsListView}
        onClose={handleCloseExpertsListView}
        experts={experts}
        onChatWithExpert={handleChatWithExpert}
        onEditExpert={handleEditExpert}
        onCreateExpert={handleCreateExpert}
        showContinueWithoutExpert={isExpertsFromConsent}
      />

      <ExpertEditModal
        isOpen={showExpertEdit}
        onClose={() => setShowExpertEdit(false)}
        expert={editingExpert}
        onSave={handleSaveExpert}
        onCreate={handleCreateExpertSave}
        onDelete={onDeleteExpert}
        isCreating={!editingExpert}
      />

      <ExpertLimitOverlay
        isOpen={showExpertLimitOverlay}
        onClose={() => setShowExpertLimitOverlay(false)}
      />

      <ToneSelectionOverlay
        isOpen={showToneSelectionOverlay}
        onClose={() => setShowToneSelectionOverlay(false)}
        selectedToneId={selectedToneId || undefined}
        onSelectTone={async (toneId) => {
          await saveTonePreference(toneId);
          setSelectedToneId(toneId);
          window.dispatchEvent(new Event('tonePreferenceChanged'));
        }}
        showContinueButton={true}
        isFirstTimeSetup={false}
      />
        </>
  );
}
