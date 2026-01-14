import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

import { X, Sparkles, Shield, Zap, Globe, Clock, HeadphonesIcon, Loader2, Copy, Download, Key, CheckCircle, LogOut, Settings, User, TrendingUp, RefreshCwOff, ArrowBigUpDash } from 'lucide-react';
import { Portal } from './Portal';
import { useTranslation } from '../../hooks/useTranslation';
import { KeyInputOverlay } from './KeyInputOverlay';
import { KeyGeneratedOverlay } from './KeyGeneratedOverlay';
import { AccountCreationOverlay } from './AccountCreationOverlay';
import { getProProductPrice, purchaseProSubscription, getAppUserID, checkProSubscriptionStatus, loginUserAnonym } from '../../utils/revenueCatDummy';
import { fetchQuotaInfo, QuotaInfo } from '../../utils/quotaApi';
import { SETUP_CONFIG } from '../../config/setup';

interface ProOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// Global cache variables
let cachedPrice: string | null = null;
let cachedProRequests: string | null = null;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function ProOverlay({ isOpen, onClose }: ProOverlayProps) {
  const { t } = useTranslation();
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showKeyGenerated, setShowKeyGenerated] = useState(false);
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [isLoadingKey, setIsLoadingKey] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [subscriberId, setSubscriberId] = useState<string | null>(null);
  const [isProUser, setIsProUser] = useState(() => {
    // Will be loaded from storage
    return false;
  });

  const [isMobile, setIsMobile] = useState(false);
  const [price, setPrice] = useState<string | null>(null);
  // Default to 250+ or cached value until loaded
  const [proRequestsCount, setProRequestsCount] = useState<number>(cachedProRequests || 50); 
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [isLoadingQuota, setIsLoadingQuota] = useState(false);

  const privacyPolicyUrl = SETUP_CONFIG.privacyPolicyUrl;
  const termsOfServiceUrl = SETUP_CONFIG.termsOfServiceUrl;
    
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const platform = Capacitor.getPlatform();
      if (platform === 'ios') {
        setIsMobile(true);
      }
    }
  }, []);


  useEffect(() => {
    const fetchPriceAndRequests = async () => {
      if (cachedPrice) setPrice(cachedPrice);
      if (cachedProRequests) setProRequestsCount(cachedProRequests);

      const apiFetchPromise = fetch('https://www.xprivo.com/auth/pricing')
        .then(async (res) => {
          if (!res.ok) return null;
          return await res.json();
        })
        .catch((err) => {
          console.error('Error fetching API pricing:', err);
          return null;
        });

      let storeFetchPromise = Promise.resolve(null);
      if (isMobile) {
        storeFetchPromise = getProProductPrice().catch((err) => {
          console.error('Error fetching App Store price:', err);
          return null;
        });
      }

      try {
        const [apiData, appStorePrice] = await Promise.all([apiFetchPromise, storeFetchPromise]);

        if (isMobile) {
            if (appStorePrice) {
                setPrice(appStorePrice);
                cachedPrice = appStorePrice;
            } else if (!cachedPrice) {
                setPrice('8€');
            }

            if (apiData && apiData.pro_requests) {
                setProRequestsCount(apiData.pro_requests);
                cachedProRequests = apiData.pro_requests;
            }
        } else {
            if (apiData) {
                if (apiData.full_price) {
                    setPrice(apiData.full_price);
                    cachedPrice = apiData.full_price;
                }
                if (apiData.pro_requests) {
                    setProRequestsCount(apiData.pro_requests);
                    cachedProRequests = apiData.pro_requests;
                }
            } else if (!cachedPrice) {
                 setPrice('8€');
            }
        }

      } catch (error) {
        console.error('Error in fetch sequence:', error);
        if (!price && !cachedPrice) setPrice('8€');
      } finally {
        setIsLoadingPrice(false);
      }
    };

    fetchPriceAndRequests();
  }, [isMobile]);

  React.useEffect(() => {
    const loadProStatus = async () => {
      const proKey = localStorage.getItem('pro_key');
      setIsProUser(!!proKey);
    };

    const handleProStatusChange = () => {
      loadProStatus();
    };

    window.addEventListener('accountStatusChanged', handleProStatusChange);
    window.addEventListener('storage', handleProStatusChange);
    loadProStatus();

    return () => {
      window.removeEventListener('accountStatusChanged', handleProStatusChange);
      window.removeEventListener('storage', handleProStatusChange);
    };
  }, []);

  React.useEffect(() => {
    const loadQuotaInfo = async () => {
      if (isOpen && isProUser) {
        const proKey = localStorage.getItem('pro_key');
        if (proKey) {
          setIsLoadingQuota(true);
          const quota = await fetchQuotaInfo(proKey);
          setQuotaInfo(quota);
          setIsLoadingQuota(false);
        }
      }
    };

    loadQuotaInfo();
  }, [isOpen, isProUser]);

  const handleLinkClick = async (event: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    event.preventDefault();
    if (isMobile) {
      await Browser.open({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
    
  const handleLogout = () => {
    localStorage.removeItem('pro_key');

    localStorage.setItem('accountStatus', 'free');
    window.dispatchEvent(new CustomEvent('accountStatusChanged', { 
      detail: { isSignedUp: false }
    }));
    window.dispatchEvent(new Event('storage'));
     
    setIsProUser(false);
    onClose();
  };

  const handleManageSubscription = () => {
    const proKey = localStorage.getItem('pro_key');
    window.open(`https://www.xprivo.com/auth/manage?id=${proKey || ''}`, '_blank');
  };

  const handleTryNow = () => {
    localStorage.setItem('accountStatus', 'pro');
    window.dispatchEvent(new CustomEvent('accountStatusChanged', { 
      detail: { isSignedUp: true }
    }));
    window.dispatchEvent(new Event('storage'));
    onClose();
  };

  const handleTryPlus = () => {
    window.dispatchEvent(new CustomEvent('showPremiumOverlay', {
      detail: { type: 'premium_suggestion' }
    }));
    onClose();
  };

  const handleUpgradeToPro = async () => {
     
    if (isMobile) {
      setIsUpgrading(true);
      try {
        const appUserID = await getAppUserID();
    
        if (!appUserID) {
          throw new Error('Failed to get user ID');
        }

        const loginSuccess = await loginUserAnonym(appUserID);

        if (!loginSuccess) {
          throw new Error('Failed to login with anonymous id');
        }
    
        const hasActiveSubscription = await checkProSubscriptionStatus();
    
        if (hasActiveSubscription) {
          setIsUpgrading(false);
          onClose();
    
          await delay(100);
    
          setIsLoadingKey(true);
          setGeneratedKey('');
          setShowKeyGenerated(true);
    
          await delay(2000);
    
          const checkSubscriberResponse = await fetch('https://www.xprivo.com/auth/checknewsubscriber', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subscriber_id: appUserID })
          });
    
          if (!checkSubscriberResponse.ok) {
            throw new Error('Failed to retrieve account key');
          }
    
          const checkSubscriberData = await checkSubscriberResponse.json();
          const proKey = checkSubscriberData.pro_key;
    
          if (!proKey) {
            throw new Error('No pro key received');
          }
    
          setGeneratedKey(proKey);
          setIsLoadingKey(false);
          return;
        }
    
        // No active subscription, proceed with purchase
        const result = await purchaseProSubscription();
    
        if (result.success && result.customerInfo) {
          const entitlements = result.customerInfo.entitlements.active;
    
          if ('pro' in entitlements) {
            setIsUpgrading(false);
            onClose();
    
            await delay(100);
    
            setIsLoadingKey(true);
            setGeneratedKey('');
            setShowKeyGenerated(true);
    
            await delay(4000);
    
            //console.log('[Purchase] Checking subscriber with ID:', appUserID);
    
            if (!appUserID) {
              throw new Error('No subscriber ID available');
            }

            const fetchKey = async () => {
              //console.log('[Purchase] Attempting to fetch from checknewsubscriber...');
              let response;
              try {
                response = await fetch('https://www.xprivo.com/auth/checknewsubscriber', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ subscriber_id: appUserID })
                });
              } catch (networkError) {
                console.error('[Purchase] Network error name:', networkError.name);
                throw new Error('Network error: Could not reach server');
              }
    
              if (!response.ok) {
                let errorBody = '';
                try {
                  errorBody = await response.text();
                  console.error('[Purchase] Server error response body:', errorBody);
                } catch (e) {
                  console.error('[Purchase] Could not read error response body');
                }
                // Throw an error to be caught by our retry logic
                throw new Error(`Server error (Status: ${response.status})`);
              }
              return response.json();
            };
    
            let checkSubscriberData;
            try {
              // First attempt
              checkSubscriberData = await fetchKey();
            } catch (error) {
              console.warn(`[Purchase] First attempt failed (${error.message}). Waiting before retry.`);

              await delay(10000);
    
              console.log('[Purchase] Retrying fetch...');

              checkSubscriberData = await fetchKey();
            }

            const proKey = checkSubscriberData.pro_key;
    
            if (!proKey) {
              throw new Error('No pro key received');
            }
    
            setGeneratedKey(proKey);
            setIsLoadingKey(false);
          } else {
            alert(t('purchase_success'));
          }
        } else if (result.error === 'User cancelled') {
          console.log('User cancelled the purchase');
        } else {
          //alert('Purchase failed: ' + (result.error || 'Unknown error')); //use that for debugging
        }
      } catch (error) {
        console.error('Purchase error:', error);
        setShowAccountCreation(false);
        setShowKeyGenerated(false);
        setIsLoadingKey(false);
        alert(t('purchase_error'));
        // However the purchase was still working
      } finally {
        setIsUpgrading(false);
      }
    } else {
      setIsUpgrading(true);
      window.location.href = "https://www.xprivo.com/auth/pro-init";
    }
  };

  const handleKeyInputSuccess = (key: string) => {
    document.cookie = `pro_key=${key}; path=/; max-age=${365 * 24 * 60 * 60}`; // 1 year
     
    localStorage.setItem('accountStatus', 'pro');
    window.dispatchEvent(new CustomEvent('accountStatusChanged', { 
      detail: { isSignedUp: true }
    }));
    window.dispatchEvent(new Event('storage'));
     
    setShowKeyInput(false);
    onClose();
  };

  const handleKeyGeneratedClose = (proKey: string) => {
    localStorage.setItem('pro_key', proKey);
    localStorage.setItem('accountStatus', 'pro');
    localStorage.setItem('pro_subscription_type', 'ios_iap');
    document.cookie = `pro_key=${proKey}; path=/; max-age=${365 * 24 * 60 * 60}`;

    window.dispatchEvent(new CustomEvent('accountStatusChanged', {
      detail: { isSignedUp: true }
    }));
    window.dispatchEvent(new Event('storage'));

    setIsProUser(true);
    setShowKeyGenerated(false);
    onClose();
  };

  return (
    <>
      {isOpen && isProUser && (
        <Portal>
      <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4" style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
      }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm" onClick={onClose}></div>

        <div
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[1000px] max-w-full max-h-[85vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center aspect-square flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm"
          >
            <X size={20} />
          </button>

          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hyphens-none">
              {t('pro_statusModal_title')}
            </h2>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 hyphens-none">
              {t('pro_statusModal_description')}
            </p>

            {isLoadingQuota ? (
              <div className="flex gap-3 mb-6 flex-wrap justify-center">
                <div className="flex-1 min-w-[200px] bg-gray-100 dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
                <div className="flex-1 min-w-[200px] bg-gray-100 dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ) : quotaInfo ? (
              <div className="flex gap-3 mb-6 flex-wrap justify-center">
                <div className="flex flex-col items-center flex-1 min-w-[200px] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div className="text-[15px] md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {(quotaInfo.requests_remaining || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 hyphens-none">{t('quota_requests_remaining')}</div>
                </div>
               
                <div className="flex flex-col items-center flex-1 min-w-[200px] bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <div className="text-[15px] md:text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {(quotaInfo.pro_requests_remaining || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 hyphens-none">{t('quota_pro_requests_remaining')}</div>
                </div>
               
                <div className="flex flex-col items-center flex-1 min-w-[200px] bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div className="text-[15px] md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {quotaInfo.expires && new Date(quotaInfo.expires * 1000).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 hyphens-none">
                    {quotaInfo.status === 'renews' ? t('quota_renews') : t('quota_ends')}
                    {quotaInfo.expired ? (
                      <div className="flex items-center justify-center mt-1">
                        <RefreshCwOff className="w-4 h-4 text-red-600 dark:text-red-400 mr-1" />
                        <span className="text-red-600 dark:text-red-400 font-bold">{t('quota_expired')}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
               
              </div>
            ) : null}

            <div className="space-y-3">
               { isMobile ? (
                  <div className="p-4 ml-4 mr-4 bg-gray-100 rounded-lg">  
                    <p className="text-sm text-gray-600 hyphens-none">
                     {t('subscription_management_text')}
                    </p>
                  </div>
                  ) :
                  (
                    <>
                      <button
                        onClick={handleManageSubscription}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4 flex-shrink-0" />
                        <span className="hyphens-none">{t('pro_statusModal_manageButton')}</span>
                      </button>
                    </>
                  )
               }
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="hyphens-none">{t('pro_statusModal_logoutButton')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
      )}

      {isOpen && !isProUser && (
        <Portal>
      <div className="fixed inset-0 z-[10003] flex items-center justify-center p-2 sm:p-4" style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))'
      }}>
        <div
          className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm"
          onClick={onClose}
        ></div>
        
        <div 
          className="relative max-w-[1000px] max-h-[85vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-10 h-10 flex items-center justify-center aspect-square flex-shrink-0 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors bg-white/50 dark:bg-gray-800/50 rounded-full backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="relative flex-shrink-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-slate-900 dark:to-black p-5 text-gray-900 dark:text-white border-b border-gray-200/50 dark:border-white/5">
            <div className="relative flex items-center gap-4 pr-10">
              <div className="w-12 h-12 bg-gray-900 dark:bg-black rounded-xl flex items-center justify-center shadow-lg border border-gray-800 dark:border-white/10 ring-1 ring-white/5 flex-shrink-0">
                <ArrowBigUpDash className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-gray-200 dark:to-gray-400 hyphens-none">
                    {t('upgrade_pro_title', { appName: 'xPrivo' })}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium tracking-wide mt-1 hyphens-none">
                    {t('upgrade_pro_subtitle_short')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="text-center mb-6">
              <div className="flex justify-center items-baseline mb-2 h-14">
                {isLoadingPrice ? (
                  <div className="flex items-baseline gap-1">
                    <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <span className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                      {price}
                    </span>
                    <span className="ml-1 text-lg font-semibold text-gray-500 dark:text-gray-400 hyphens-none">
                      /{t('per_month')}{ isMobile ? null : <small>*</small> }
                    </span>
                  </>
                )}
              </div>

              {/*<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {t('upgrade_pro_feature_intro_title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
                {t('upgrade_pro_feature_intro_subtitle')}
              </p>*/}
              <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto hyphens-none">
                {t('upgrade_pro_feature_intro_subtitle_small')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6">
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ArrowBigUpDash className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm hyphens-none">{t('upgrade_pro_feature1_title')}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 hyphens-none">{t('upgrade_pro_feature1_description')}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  {/* UPDATED TO SHOW DYNAMIC REQUEST COUNT */}
                  <div className="font-medium text-gray-900 dark:text-white text-sm hyphens-none"> {t('upgrade_pro_feature5_title', { proRequestsCount: proRequestsCount })}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 hyphens-none">{t('upgrade_pro_feature5_description')}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm hyphens-none">{t('upgrade_pro_feature2_title')}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 hyphens-none">{t('upgrade_pro_feature2_description')}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm hyphens-none">{t('upgrade_pro_feature3_title')}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 hyphens-none">{t('upgrade_pro_feature3_description')}</div>
                </div>
              </div>
            </div>

            { isMobile ? ( null ) : (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-center sm:text-left text-gray-700 dark:text-gray-300 hyphens-none">
                  {t('upgrade_pro_tryPlus_prompt')}
                  <button 
                    onClick={handleTryPlus}
                    className="text-blue-600 dark:text-blue-400 hover:underline ml-1 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    {t('upgrade_pro_tryPlus_button')}
                  </button>
                </p>
              </div>
            )} 

             { isMobile ? ( 
            <div className="max-w-md mx-auto p-6 font-sans bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h1 className="text-base font-bold text-center text-gray-900 dark:text-white hyphens-none">
                {t('subscription_details')}
              </h1>
       
              <div className="mt-8 space-y-8">
                <div>
                  <h2 className="font-medium text-sm font-semibold text-gray-800 dark:text-gray-200 hyphens-none">
                      {t('subscription_monthly')}
                  </h2>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 hyphens-none">
                   {t('subscription_monthly_text')}
                  </p>
                </div>
       
                <div>
                  <h2 className="font-medium text-sm font-semibold text-gray-800 dark:text-gray-200 hyphens-none">
                    {t('subscription_auto_extend')}
                  </h2>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 hyphens-none">
                    {t('subscription_auto_extend_text')}
                  </p>
                </div>
       
                <div>
                  <h2 className="font-medium text-sm font-semibold text-gray-800 dark:text-gray-200 hyphens-none">
                    {t('subscription_cancellation')}
                  </h2>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 hyphens-none">
                    {t('subscription_cancellation_text')}
                  </p>
                </div>
       
              </div>

               <div className="mt-10 flex flex-wrap justify-between gap-x-4 gap-y-2">
              <a href={privacyPolicyUrl} onClick={(e) => handleLinkClick(e, privacyPolicyUrl)} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 dark:text-green-500 hover:underline hyphens-none">{t('common_privacyPolicy')}</a>
                  <a href={termsOfServiceUrl} onClick={(e) => handleLinkClick(e, termsOfServiceUrl)} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 dark:text-green-500 hover:underline hyphens-none">{t('common_termsOfService')}</a>
              </div>
            </div>
       
            ) : null }

            <small>{ isMobile ? null : <span className="hyphens-none">* {t('upgrade_no_tax')}</span> } </small>
          </div>

          <div className="flex-shrink-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowKeyInput(true)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-900"
              >
                <div className="flex items-center justify-center gap-2">
                  {isMobile ? (
                    <>
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="hyphens-none">{t('login_AccountPRO')}</span>
                    </>
                  ):
                  (
                    <>
                      <Key className="w-4 h-4 flex-shrink-0" />
                      <span className="hyphens-none">{t('upgrade_pro_useExistingKey_button')}</span>
                    </>
                  )}
                </div>
              </button>
              
              <button
                onClick={handleUpgradeToPro}
                disabled={isUpgrading}
                className="group relative flex-1 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
              >

                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-[#d9a420] dark:to-[#bc890d] transition-transform duration-500"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-shine"></div>

                <div className="relative w-full flex items-center justify-center gap-2 py-3 px-4 text-white font-bold">
                  {isUpgrading ? (
                    <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-white flex-shrink-0" />
                  )}
                  <span className="hyphens-none">{isUpgrading ? t('upgrade_pro_processing_button') : t('upgrade_pro_upgrade_button')}</span>
                </div>
              </button>
            </div>
            {isMobile ? 
              <div className="mt-4 text-center">
               <p className="text-xs text-gray-500 dark:text-gray-400 hyphens-none">
                  {t('recurring_payment_notice')}
                </p>
              </div>
              : ( 
                null
            )}
          </div>
        </div>
      </div>
    </Portal>
      )}

      <KeyInputOverlay
        isOpen={showKeyInput}
        onClose={() => setShowKeyInput(false)}
        onSuccess={handleKeyInputSuccess}
      />

      <KeyGeneratedOverlay
        isOpen={showKeyGenerated}
        onClose={handleKeyGeneratedClose}
        generatedKey={generatedKey}
        skipPayment={isMobile}
        isLoading={isLoadingKey}
      />

      <AccountCreationOverlay
        isOpen={showAccountCreation}
      />
    </>
  );
}