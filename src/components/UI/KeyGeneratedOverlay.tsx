import React, { useState } from 'react';
import { X, Copy, Download, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Portal } from './Portal';
import { downloadSingleKey } from '../../utils/chatBackup';
import { useTranslation } from '../../hooks/useTranslation';

interface KeyGeneratedOverlayProps {
  isOpen: boolean;
  onClose: (key: string) => void;
  generatedKey: string;
  skipPayment?: boolean;
  isLoading?: boolean;
}
 
export function KeyGeneratedOverlay({ isOpen, onClose, generatedKey, skipPayment = false, isLoading = false }: KeyGeneratedOverlayProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy key:', error);
    }
  };

  const handleDownloadKeyDesktop = () => {
    const blob = new Blob([generatedKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRO-Key-${generatedKey}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadKey = async () => {
    try {
      await downloadSingleKey(generatedKey, 'full_backup');
    } catch (error) {
      console.error('Error downloading key:', error);
    }
  };

  const handleProceedToPayment = () => {
    window.open(`https://www.xprivo.com/auth/key?id=${generatedKey}`, '_blank');
    onClose(generatedKey);
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[10004] flex items-center justify-center p-4" style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
      }}>
        <div
          className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm"
          onClick={isLoading ? undefined : () => onClose(generatedKey)}
        ></div>
        
        <div 
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {!isLoading && (
            <button
              onClick={() => onClose(generatedKey)}
              className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm"
            >
              <X size={20} />
            </button>
          )}

          <div className="p-6">
            {isLoading ? (
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                   {t('account_creation')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                   {t('account_creation_text')}
                </p>
              </div>
            ) : (
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {skipPayment ? t('account_your_key_title') : 'Your PRO Key has been generated!'}
                </h3>
                {skipPayment && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('account_key_subtitle')}
                  </p>
                )}
              </div>
            )}

            {!isLoading && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                    {t('acount_save_key_safe')}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    {skipPayment
                      ? t('account_your_key_extended_warning') 
                      : 'This is the only way to access your PRO features on other devices or if you clear your browser data. Without it, your access is lost.'}
                  </p>
                </div>
              </div>
            </div>
            )}

            {!isLoading && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"> {t('account_your_key')}</p>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 font-mono text-sm text-gray-900 dark:text-white break-all">
                  {generatedKey}
                </div>
              </div>
            </div>
            )}

            {!isLoading && (
            <div className="space-y-3 mb-6">
              <div className="flex gap-3">
                <button
                  onClick={handleCopyKey}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? t('copied_confirmation') : t('copy_key_action')}</span>
                </button>
                
                <button
                  onClick={handleDownloadKey}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('account_download_key')}</span>
                </button>
              </div>
            </div>
            )}

            {!skipPayment && (
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Once you've saved your key, proceed to payment.
                </p>

                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  Proceed to Payment
                </button>
              </div>
            )}

            {skipPayment && !isLoading && (
              <div className="text-center mb-4">
                <button
                  onClick={() => onClose(generatedKey)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  {t('account_done')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}