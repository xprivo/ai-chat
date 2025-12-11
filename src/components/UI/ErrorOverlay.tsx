import React from 'react';
import { X, AlertCircle, Crown, ShieldCheck } from 'lucide-react';
import { Portal } from './Portal';
import { useTranslation } from '../../hooks/useTranslation';

interface ErrorOverlayProps {
  isOpen: boolean;
  title: string;
  text: string;
  showProButton?: boolean;
  onClose: () => void;
  onShowPro?: () => void;
  icon?: string;
}
 
export function ErrorOverlay({ 
  isOpen, 
  title, 
  text, 
  showProButton = false, 
  onClose, 
  onShowPro,
  icon = 'warning'
}: ErrorOverlayProps) {
  if (!isOpen) return null;
  const { t } = useTranslation();
  const handleProClick = () => {
    onClose();
    if (onShowPro) {
      onShowPro();
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[10004] flex items-center justify-center p-4" style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
        
        <div 
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-[800px] border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm"
          >
            <X size={20} />
          </button>

          <div className="p-6 text-center">
           
            {icon === 'warning' ? ( 
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            ) : icon === 'protected' ? ( 
                 <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-14 h-14 text-green-600 dark:text-green-400" />
                  </div>
            ) : (
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        stroke-width="2" 
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        className="w-8 h-8 text-green-600 dark:text-green-500"
                      >
                      <path d="M12 2a10 10 0 0 1 7.38 16.75"/>
                      <path d="m16 12-4-4-4 4"/>
                      <path d="M12 16V8"/>
                      <path d="M2.5 8.875a10 10 0 0 0-.5 3"/>
                      <path d="M2.83 16a10 10 0 0 0 2.43 3.4"/>
                      <path d="M4.636 5.235a10 10 0 0 1 .891-.857"/>
                      <path d="M8.644 21.42a10 10 0 0 0 7.631-.38"/>
                    </svg>
                  </div>
              )}
                
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              {text}
            </p>
            
            <div className="flex gap-3 justify-center">
              {showProButton ? (
                null
              ):
              (
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
                >
                  {t('modal_close')}
                </button>
              )}
              
              {showProButton && (
                <button
                  onClick={handleProClick}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  {t('discover_pro')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}