import React, { useState } from 'react';
import { X, Gift, Loader2, CheckCircle, Copy } from 'lucide-react';
import { Portal } from './Portal';
import { useTranslation } from '../../hooks/useTranslation';

interface InviteFriendsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}
 
export function InviteFriendsOverlay({ isOpen, onClose }: InviteFriendsOverlayProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError( t('invitation_enter_address'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('invitation_enter_valid_address'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('https://www.xprivo.com/auth/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit invitation');
      }

      const data = await response.json();
      
      if (data.code) {
        setInviteCode(data.code);
      } else {
        setError( t('invitation_failed'));
      }
    } catch (err) {
      console.error('Invitation error:', err);
      setError(t('invitation_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    const inviteLink = `https://www.xprivo.com/hello?invite=${inviteCode}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleClose = () => {
    setEmail('');
    setInviteCode('');
    setError('');
    setCopied(false);
    onClose();
  };

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-[10003] flex items-center justify-center p-4 sm:p-6" 
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm" onClick={handleClose}></div>
        
        <div 
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-[900px] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 max-h-[85dvh] sm:max-h-[90dvh]"
          style={{ 
            maxHeight: 'calc(100dvh - 3rem)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-20 p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors bg-white/60 dark:bg-gray-800/60 rounded-full backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Close"
          >
            <X size={22} />
          </button>

          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pr-10">
              {inviteCode ? t('invitation_successTitle') : t('invitation_title')}
            </h2>
          </div>

          {!inviteCode ? (
            <>
              <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2">
                    {t('invitation_winners_month', { count: 10 })}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mx-auto">
                    {t('invitation_description')}
                  </p>
                </div>
    
                <form id="invite-form" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('invitation_emailLabel')}
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('invitation_emailPlaceholder')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                    {error && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}
                  </div>
                </form>
    
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-xs text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
                    <strong>{t('invitation_privacyNoticeTitle')}</strong> {t('invitation_privacyNoticeBody')}
                    <br/>
                    <strong>{t('invitation_tip')}</strong> {t('invitation_tip_text')}
                    <br/>
                    <strong>{t('invitation_not_allowed_self')}</strong>
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
                <button
                  type="submit"
                  form="invite-form"
                  disabled={isSubmitting || !email.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-900"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('invitation_submittingButton')}</span>
                    </div>
                  ) : (
                    t('invitation_getLinkButton')
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
                  {t('invitation_successDescription')}
                </p>
    
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('invitation_linkReadyLabel')}</div>
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 font-mono text-sm text-gray-900 dark:text-white break-all">
                    https://www.xprivo.com/hello?invite={inviteCode}
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-900"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? t('invitation_copiedButton') : t('invitation_copyLinkButton')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Portal>
  ); 
}