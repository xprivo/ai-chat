import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { X, Sparkles, Shield, Search, Image, Smartphone, Zap, Crown, FileText, ExternalLink, BadgeCheck } from 'lucide-react';
import { Portal } from './Portal';
import { useTranslation } from '../../hooks/useTranslation';

interface PremiumOverlayProps {
  isOpen: boolean;
  type: 'premium_suggestion' | 'limit_reached';
  onClose: () => void;
}

export function PremiumOverlay({ isOpen, type, onClose }: PremiumOverlayProps) {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const platform = Capacitor.getPlatform();
      if (platform === 'ios') {
        setIsMobile(true);
      }
    }
  }, []);
  
  if (!isOpen) return null;

  const isPremiumSuggestion = type === 'premium_suggestion';

  const handleTryNow = () => {
     window.location.replace('https://www.xprivo.com/plus/register');
  };

  const handlePlus = async () => {
    const url = "https://www.xprivo.com/plus/learn-more";
    await Browser.open({ url });
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
          className="relative max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 flex-shrink-0 w-9 h-9 min-w-[2.25rem] min-h-[2.25rem] p-0 aspect-square flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-white/70 dark:hover:text-white transition-colors bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 rounded-full backdrop-blur-md"
          >
            <X size={20} className="flex-shrink-0" />
          </button>

          <div className="relative flex-shrink-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-slate-900 dark:to-black p-8 text-gray-900 dark:text-white border-b border-gray-200/50 dark:border-white/5">
            
            <div className="relative pr-10">
              <div className="flex items-center gap-4 mb-1">
                <div className="flex-shrink-0 w-14 h-14 bg-gray-900 dark:bg-black rounded-2xl flex items-center justify-center shadow-lg border border-gray-800 dark:border-white/10 ring-1 ring-white/5">
                  {isPremiumSuggestion ? (
                    <BadgeCheck className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                  ) : (
                    <Crown className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                  )}
                </div>
                
                <div className="min-w-0">
                  <h2 className="text-2xl max-[380px]:text-lg max-[410px]:text-xl font-bold tracking-tight hyphens-none text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-gray-200 dark:to-gray-400">
                    {isPremiumSuggestion ? t('premiumOverlay_suggestionTitle') : t('premiumOverlay_limitTitle')}
                  </h2>
                  
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide mt-1 hidden min-[500px]:block hyphens-none">
                    {isPremiumSuggestion ? t('premiumOverlay_suggestionSubtitle') : t('premiumOverlay_limitSubtitle')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hyphens-none">
                {isPremiumSuggestion 
                  ? t('premiumOverlay_suggestionHeadline') 
                  : t('premiumOverlay_limitHeadline')
                }
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-[90%] mx-auto hyphens-none">
                {isPremiumSuggestion 
                  ? t('premiumOverlay_suggestionDescription')
                  : t('premiumOverlay_limitDescription')
                }
              </p>

              {isPremiumSuggestion && (
                <p className="mt-2 text-blue-600 dark:text-[#d9a420] font-medium text-sm min-[500px]:hidden hyphens-none">
                  {t('premiumOverlay_suggestionSubtitle')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Zap, color: 'bg-blue-500', title: 'premiumOverlay_feature1Title', desc: 'premiumOverlay_feature1Description' },
                { icon: Search, color: 'bg-emerald-500', title: 'premiumOverlay_feature2Title', desc: 'premiumOverlay_feature2Description' },
                { icon: Image, color: 'bg-purple-500', title: 'premiumOverlay_feature3Title', desc: 'premiumOverlay_feature3Description' },
                { icon: Shield, color: 'bg-indigo-500', title: 'premiumOverlay_feature4Title', desc: 'premiumOverlay_feature4Description' },
                { icon: Smartphone, color: 'bg-orange-500', title: 'premiumOverlay_feature5Title', desc: 'premiumOverlay_feature5Description' },
                { icon: FileText, color: 'bg-cyan-500', title: 'premiumOverlay_feature6Title', desc: 'premiumOverlay_feature6Description' }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/40 shadow-sm hover:bg-white/80 dark:hover:bg-gray-800/60 transition-colors">
                  <div className={`w-9 h-9 ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm hyphens-none">{t(feature.title)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hyphens-none">{t(feature.desc)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-black/40 backdrop-blur-xl z-10">
            <button
              onClick={isMobile ? handlePlus : handleTryNow}
              className="group relative w-full overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
            >

              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-[#d9a420] dark:to-[#bc890d] transition-transform duration-500"></div>
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-shine"></div>
              
              <div className="relative py-4 px-6 flex items-center justify-center gap-3">
                <ExternalLink className="w-5 h-5 text-white flex-shrink-0" />
                <span className="font-bold text-white text-lg tracking-wide hyphens-none">
                  { t('premiumOverlay_plusTest')}
                </span>
              </div>
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 opacity-80 hyphens-none">
                {t('premiumOverlay_footerNote')}
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </Portal>
  );
}