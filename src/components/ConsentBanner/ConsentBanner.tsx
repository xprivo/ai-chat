import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { Lock, Heart, Cookie, CloudOff, ShieldCheck } from 'lucide-react';
import { SETUP_CONFIG } from '../../config/setup';
import { storage } from '../../utils/storage';
import { useTranslation } from '../../hooks/useTranslation';
import { ExpertSuggestionOverlay } from '../UI/ExpertSuggestionOverlay';
import { ToneSelectionOverlay } from '../UI/ToneSelectionOverlay';
import { saveTonePreference } from '../../utils/toneStorage';

export function ConsentBanner() {
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);
  const [showExpertSuggestion, setShowExpertSuggestion] = useState(false);
  const [showToneSelection, setShowToneSelection] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const platform = Capacitor.getPlatform();
      if (platform === 'ios') {
        setIsMobile(true);
      }
    }
  }, []);
  
  useEffect(() => {
    const checkConsent = async () => {
      if (!SETUP_CONFIG.consentBanner.enabled) return;
      
      try {
        const hasConsented = await storage.settings.get('userConsent');
        if (hasConsented !== 'true') {
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error checking consent:', error);
        setIsVisible(true);
      }
    };

    checkConsent();
  }, []);

  const handleConsent = async () => {
    setIsVisible(false);
    try {
      await storage.settings.set('userConsent', 'true');
      if(SETUP_CONFIG.showWelcomePersonalisation==='expert'){
        setShowExpertSuggestion(true);
      }
      else if(SETUP_CONFIG.showWelcomePersonalisation==='tone'){
        setShowToneSelection(true);
      }
      
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  };

  const handleBrowseExperts = () => {
    setShowExpertSuggestion(false);
    window.dispatchEvent(new CustomEvent('showExpertsFromConsent'));
  };

  const handleMaybeLater = () => {
    setShowExpertSuggestion(false);
  };

  const handleLinkClick = async (event: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    event.preventDefault(); 
    if (isMobile) {
      await Browser.open({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getIcon = (iconType: string) => {
    const iconProps = { size: 24, className: "text-blue-500" };
    
    switch (iconType) {
      case 'lock':
        return <Lock {...iconProps} />;
      case 'shield':
        return <ShieldCheck {...iconProps} />;
      case 'heart':
        return <Heart {...iconProps} />;
      case 'cloudoff':
        return <CloudOff {...iconProps} />;
      default:
        return <Lock {...iconProps} />;
    }
  };

  if (!isVisible && !showExpertSuggestion && !showToneSelection) return null;

return (
    <>
    {isVisible && (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-[1200px] flex flex-col overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[85dvh] sm:max-h-[90dvh]"
        style={{ 
          maxHeight: 'calc(100dvh - 3rem)',
        }}
      >
        <div
          className="
            absolute inset-0 rounded-2xl pointer-events-none
            [mask-image:linear-gradient(to_bottom,white_60%,transparent_100%)]
            shadow-[inset_0_0_12px_0_rgba(96,165,250,0.5),_inset_0_0_6px_0_rgba(59,130,246,0.7)]
            dark:shadow-[inset_0_0_12px_0_rgba(251,191,36,0.5),_inset_0_0_6px_0_rgba(245,158,11,0.7)]
          "
          aria-hidden="true"
        ></div>

        <div className="flex-shrink-0 p-5 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-center items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t('welcome_title', { appName: SETUP_CONFIG.appName })}
          </h1>
          <img
            src="/assets/logo/xprivo-app.png"
            alt="Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-md"
          />
        </div>
    
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <p className="text-md font-light text-gray-600 dark:text-white/80 text-center mb-6 max-w-xl mx-auto">
            {t('welcome_subtitle', { appName: SETUP_CONFIG.appName })}
          </p>
    
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 flex items-center gap-4 flex-1 basis-[350px]">
              <div className="flex-shrink-0 text-blue-500 dark:text-blue-400">{getIcon('lock')}</div>
              <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{t('welcome_feature1_description')}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 flex items-center gap-4 flex-1 basis-[350px]">
              <div className="flex-shrink-0 text-blue-500 dark:text-blue-400">{getIcon('shield')}</div>
              <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{t('welcome_feature2_description')}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 flex items-center gap-4 flex-1 basis-[350px]">
              <div className="flex-shrink-0 text-blue-500 dark:text-blue-400">{getIcon('heart')}</div>
              <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{t('welcome_feature3_description')}</p>
            </div>
          </div>
    
          <p className="text-gray-600 dark:text-gray-300 text-sm text-center leading-relaxed">
            {
              SETUP_CONFIG.acceptConsentBanner
                ? t('welcome_consent_prefix')
                : t('welcome_consent_find_prefix')
            }
            <a
              href={SETUP_CONFIG.privacyPolicyUrl}
              onClick={(e) => handleLinkClick(e, SETUP_CONFIG.privacyPolicyUrl)}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline ml-1"
            >
              {t('common_privacyPolicy')}
            </a>
            {' '}{t('common_and')}{' '}
            <a
              href={SETUP_CONFIG.termsOfServiceUrl}
              onClick={(e) => handleLinkClick(e, SETUP_CONFIG.termsOfServiceUrl)}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              {t('common_termsOfService')}
            </a>
          </p>
    
          <div className="mt-8 text-center">
            <img
              src="/assets/appassets/xprivo-octopus-blind-min.webp"
              alt="xPrivo Cat"
              className="h-36 sm:h-48 mx-auto"
            />
          </div>
        </div>
    
        <div className="flex-shrink-0 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
          <button
            onClick={handleConsent}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-gray-800"
          >
            {
              SETUP_CONFIG.acceptConsentBanner
                ? t('welcome_acceptAndContinueButton')
                : t('welcome_consent_continue_button')
            }
          </button>
        </div>
      </div>
    </div>
    )}

    <ExpertSuggestionOverlay
      isOpen={showExpertSuggestion}
      onBrowseExperts={handleBrowseExperts}
      onMaybeLater={handleMaybeLater}
    />

    <ToneSelectionOverlay
      isOpen={showToneSelection}
      onClose={() => setShowToneSelection(false)}
      onSelectTone={async (toneId) => {
        await saveTonePreference(toneId);
        setShowToneSelection(false);
        window.dispatchEvent(new Event('tonePreferenceChanged'));
      }}
      showContinueButton={true}
      isFirstTimeSetup={true}
    />
    </>
  );
}