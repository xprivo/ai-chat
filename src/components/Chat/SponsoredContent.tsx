import React from 'react';
import { Capacitor } from '@capacitor/core';
import { Mail, Shield, ShoppingBag, Speaker, Sparkles, Gift } from 'lucide-react';

interface SponsoredAd {
  id: string;
  sponsored_title: string;
  sponsored_desc_1: string;
  sponsored_desc_2: string;
  sponsored_notice: 'sponsored' | 'partner' | 'offer' | 'promoted';
  save_text: string;
  url: string;
  visible_url: string;
  image: string;
  svg: 'shopping' | 'speaker' | 'sparkle' | 'gift' | 'mail' | 'shield' | '';
  advertiser_name: string;
}

interface SponsoredContentProps {
  ads: SponsoredAd[];
  t: (key: string) => string;
}

export function SponsoredContent({ ads, t }: SponsoredContentProps) {
  const getSvgIcon = (svgType: string) => {
    const iconProps = { size: 16, className: "text-white" };
    
    switch (svgType) {
      case 'shopping':
        return <ShoppingBag {...iconProps} />;
      case 'speaker':
        return <Speaker {...iconProps} />;
      case 'sparkle':
        return <Sparkles {...iconProps} />;
      case 'gift':
        return <Gift {...iconProps} />;
      case 'mail':
        return <Mail {...iconProps} />;
      case 'shield':
        return <Shield {...iconProps} />;
      default:
        return <Mail {...iconProps} />;
    }
  };

  const getNoticeText = (notice: string) => {
    switch (notice) {
      case 'sponsored':
        return t('notice_sponsored');
      case 'partner':
        return t('notice_partner');
      case 'offer':
        return t('notice_offer');
      case 'promoted':
        return t('notice_promoted');
      default:
        return t('notice_sponsored');
    }
  };

  const handleAdClick = (url: string, title?: string) => {
    if (Capacitor.isNativePlatform()) {
      window.dispatchEvent(new CustomEvent('openInBrowser', {
        detail: { url, title: title || '', description: '', favicon: '' },
      }));
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
   <div className="flex flex-wrap justify-center gap-5">
      {ads.map((ad) => (
        <div
          key={ad.id}
          onClick={() => handleAdClick(ad.url, ad.sponsored_title)}
          className="relative bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-750 transition-all duration-200 hover:scale-[1.02] group flex-shrink-0 text-[14px] max-w-[300px] basis-[300px] min-[400px]:max-w-[350px] min-[400px]:basis-[350px]"
        > 
          {ad.save_text && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg z-10">
              {ad.save_text}
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {ad.image ? (
                <img
                  src={ad.image}
                  alt={ad.sponsored_title}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  {getSvgIcon(ad.svg)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 text-left">
              <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors text-left">
                {ad.sponsored_title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed mb-1 line-clamp-2 text-left">
                {ad.sponsored_desc_1}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs text-left">
                {ad.sponsored_desc_2}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide" style={{ fontSize: '10px' }}>
                {getNoticeText(ad.sponsored_notice)}
              </span>
            </div>
            {ad.save_text && ( <div 
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded-full font-medium transition-colors whitespace-nowrap" 
              style={{ fontSize: '10px' }}
            >
              {t('offer')} 
            </div>)}
          </div>
        </div>
      ))}
    </div>
  );
}