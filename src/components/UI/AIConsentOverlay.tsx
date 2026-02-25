import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { capacitorStorage } from '../../utils/capacitorStorage';
import { Portal } from './Portal';
import { useTranslation } from '../../hooks/useTranslation';

const CONSENT_KEY = 'consent_app_ai';

export async function getAIConsent(): Promise<boolean | null> {
  if (!Capacitor.isNativePlatform()) return true;
  const val = await capacitorStorage.getItem(CONSENT_KEY);
  if (val === null) return null;
  return val === 'true';
}

export async function setAIConsent(value: boolean): Promise<void> {
  await capacitorStorage.setItem(CONSENT_KEY, value ? 'true' : 'false');
}

interface AIConsentOverlayProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function AIConsentOverlay({ onAccept, onDecline }: AIConsentOverlayProps) {
  const { t } = useTranslation();
  return (
    <Portal>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10010] flex items-end sm:items-center justify-center p-4 sm:p-6">
        <div
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-neutral-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('data_processing_notice_title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {t('data_processing_notice_body')}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={onAccept}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl transition-colors"
              >
                {t('accept')}
              </button>
              <button
                onClick={onDecline}
                className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:active:bg-neutral-500 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
              >
                {t('decline')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

export function useAIConsent() {
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);
  const [showConsentOverlay, setShowConsentOverlay] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNative) {
      setConsentGranted(true);
      setConsentChecked(true);
      return;
    }
    getAIConsent().then((val) => {
      setConsentGranted(val === true);
      setConsentChecked(true);
    });
  }, [isNative]);

  const requestConsent = async (): Promise<boolean> => {
    if (!isNative) return true;
    const current = await getAIConsent();
    if (current === true) {
      setConsentGranted(true);
      return true;
    }
    setShowConsentOverlay(true);
    return false;
  };

  const handleAccept = async () => {
    await setAIConsent(true);
    setConsentGranted(true);
    setShowConsentOverlay(false);
  };

  const handleDecline = async () => {
    await setAIConsent(false);
    setConsentGranted(false);
    setShowConsentOverlay(false);
  };

  return {
    consentChecked,
    consentGranted,
    showConsentOverlay,
    requestConsent,
    handleAccept,
    handleDecline,
  };
}
