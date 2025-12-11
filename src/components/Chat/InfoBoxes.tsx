import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

import { X, Lock, Shield, Heart } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { storage } from '../../utils/storage';
 
export function InfoBoxes() {
  const { t, language } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

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
    const loadVisibility = async () => {
      try {
        const stored = await storage.settings.get('hideInfoBoxes');
        setIsVisible(stored !== 'true');
      } catch (error) {
        console.error('Error loading info boxes visibility:', error);
      }
    };

    loadVisibility();
  }, []);

  const handleLinkClick = async (event: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    event.preventDefault(); 
    if (isMobile) {
      await Browser.open({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  const handleDismiss = async () => {
    setIsVisible(false);
    try {
      await storage.settings.set('hideInfoBoxes', 'true');
    } catch (error) {
      console.error('Error saving info boxes visibility:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="mt-8 max-w-4xl mx-auto pointer-events-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('whateverYouAskMeIs')}
          </h3>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('private')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('unlikeOtherAssistants')}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('safeguarded')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('notEvenWeCanAccess')}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('treatedWithRespect')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('conversationsNeverUsedForTraining')}
            </p>
          </div>
        </div>
        
       <div className="mt-4 flex items-center justify-center gap-x-6">
            <a
              href={language === "en" ? "https://www.xprivo.com/mission" : `https://www.xprivo.com/mission/${language}`}
              onClick={(e) => handleLinkClick(e, language === "en" ? "https://www.xprivo.com/mission" : `https://www.xprivo.com/mission/${language}`)}
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {t('home_ourMissionLink')}
            </a>
          
            <button
              onClick={handleDismiss}
              className="text-sm text-gray-600 hover:underline dark:text-gray-400"
            >
              {t('modal_close')}
            </button>
        </div>
      </div>
    </div>
  );
}