import React, { useState, useEffect } from 'react';;
import { Capacitor } from '@capacitor/core';

import { X, Key, Upload, Loader2, CheckCircle, User } from 'lucide-react';
import { Portal } from './Portal';
import { useTranslation } from '../../hooks/useTranslation';

interface KeyInputOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (key: string) => void;
}

export function KeyInputOverlay({ isOpen, onClose, onSuccess }: KeyInputOverlayProps) {
  const { t } = useTranslation();
  const [keyInput, setKeyInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setKeyInput(content.trim());
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const handleSubmit = async () => {
    if (!keyInput.trim()) {
      setError(t('pro_input_error_enterKey'));
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const response = await fetch('https://www.xprivo.com/auth/check-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: keyInput.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          localStorage.setItem('pro_key', keyInput.trim());
          localStorage.setItem('accountStatus', 'pro');
          window.dispatchEvent(new CustomEvent('accountStatusChanged', { 
            detail: { isSignedUp: true }
          }));
          window.dispatchEvent(new Event('storage'));
          
          onSuccess(keyInput.trim());
        }, 1500);
      } else {
        setError(t('pro_input_error_invalidKey'));
      }
    } catch (error) {
      console.error('Error validating key:', error);
      setError(t('pro_input_error_validationFailed'));
    } finally {
      setIsValidating(false);
    }
  };

  const handleClose = () => {
    setKeyInput('');
    setError('');
    setShowSuccess(false);
    onClose();
  };

  if (showSuccess) {
    return (
      <Portal>
        <div className="fixed inset-0 z-[10004] flex items-center justify-center p-4" style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
        }}>
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm"></div>
          
          <div 
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[1000px] max-w-full p-8 border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('pro_input_success_title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {t('pro_input_success_description')}
              </p>
            </div>
          </div>
        </div>
      </Portal>
    );
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[10004] flex items-center justify-center p-4" style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
      }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm" onClick={handleClose}></div>

        <div 
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[1000px] max-w-full border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm"
          >
            <X size={20} />
          </button>

          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                {isMobile ? (
                  <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                ):
                (
                  <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                 {!isMobile ? (  <>{t('pro_input_title')}</> ) : ( <>{t('pro_input_title_mobile')}</>)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {!isMobile ? (  <> {t('pro_input_description')} </> ) : ( <>{t('pro_input_description_mobile')}</>)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {!isMobile ? (  <> {t('pro_input_keyLabel')}  </> ) : ( <>{t('pro_input_keyLabel_mobile')}</>)}
                </label>
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder={t('pro_input_keyPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
              </div>

              <div className="text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('pro_input_orSeparator')}</span>
              </div>

              <div>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="key-file-upload"
                />
                <label
                  htmlFor="key-file-upload"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>{!isMobile ? (  <> {t('pro_input_uploadButton')}  </> ) : ( <>{t('pro_input_uploadButton_mobile')}</>)}</span>
                  
                </label>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isValidating || !keyInput.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('pro_input_validatingButton')}</span>
                  </div>
                ) : (
                  isMobile ? t('pro_input_submitButton_mobile') : t('pro_input_submitButton')
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}