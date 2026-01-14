import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { Portal } from './Portal';
import { Textarea } from './Textarea';
import { Input } from './Input';
import { generateCustomPDF, generateCustomWord } from '../../utils/documentDownload';
import { useTranslation } from '../../hooks/useTranslation';

interface CustomTemplateOverlayProps {
  isOpen: boolean;
  content: string;
  onClose: () => void;
}

export function CustomTemplateOverlay({ isOpen, content, onClose }: CustomTemplateOverlayProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<'simple' | 'header' | 'footer'>('simple');
  const [senderInfo, setSenderInfo] = useState('');
  const [recipientInfo, setRecipientInfo] = useState('');
  const [footerInfo, setFooterInfo] = useState('');
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [customLogoBase64, setCustomLogoBase64] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<'top-left' | 'top-right' | 'top-center'>('top-left');
  const [selectedFont, setSelectedFont] = useState<'helvetica' | 'times' | 'courier'>('helvetica');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate('simple');
      setSenderInfo('');
      setRecipientInfo('');
      setFooterInfo('');
      setShowPageNumbers(false);
      setCustomLogoBase64(null);
      setLogoPosition('top-left');
      setSelectedFont('helvetica');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomLogoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async (type: 'pdf' | 'word') => {
    setIsLoading(true);
    try {
      const options = {
        template: selectedTemplate,
        font: selectedFont,
        logo: customLogoBase64,
        position: logoPosition,
        response: content,
        senderInfo,
        recipientInfo,
        footerInfo,
        showPageNumbers
      };

      if (type === 'pdf') {
        await generateCustomPDF(options);
      } else {
        await generateCustomWord(options);
      }

      onClose();
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
          className="relative max-h-[85vh] w-[1000px] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >

          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('template_title')}
              </h2>
              <button
                onClick={onClose}
                className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('template_section_layout')}
              </h3>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="template"
                    value="simple"
                    checked={selectedTemplate === 'simple'}
                    onChange={(e) => setSelectedTemplate(e.target.value as 'simple')}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{t('template_layout_simple')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('template_layout_simple_desc')}
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="template"
                    value="header"
                    checked={selectedTemplate === 'header'}
                    onChange={(e) => setSelectedTemplate(e.target.value as 'header')}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{t('template_layout_header')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('template_layout_header_desc')}
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="template"
                    value="footer"
                    checked={selectedTemplate === 'footer'}
                    onChange={(e) => setSelectedTemplate(e.target.value as 'footer')}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{t('template_layout_footer')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('template_layout_footer_desc')}
                    </div>
                  </div>
                </label>
              </div>

              {(selectedTemplate === 'header' || selectedTemplate === 'footer') && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('template_label_sender')}
                      </label>
                      <Textarea
                        value={senderInfo}
                        onChange={(e) => setSenderInfo(e.target.value)}
                        rows={3}
                        className="w-full p-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                        placeholder={t('template_placeholder_address')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('template_label_recipient')}
                      </label>
                      <Textarea
                        value={recipientInfo}
                        onChange={(e) => setRecipientInfo(e.target.value)}
                        rows={3}
                        className="w-full p-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                        placeholder={t('template_placeholder_address')}
                      />
                    </div>
                  </div>

                  {selectedTemplate === 'footer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('template_label_footer')}
                      </label>
                      <Textarea
                        value={footerInfo}
                        onChange={(e) => setFooterInfo(e.target.value)}
                        rows={2}
                        className="w-full p-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                        placeholder={t('template_placeholder_footer_details')}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPageNumbers}
                    onChange={(e) => setShowPageNumbers(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('template_checkbox_page_numbers')}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('template_section_identity')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {t('template_identity_desc')}
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleLogoSelected}
                  className="hidden"
                />

                {!customLogoBase64 ? (
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <Upload size={32} className="mb-2" />
                    <span className="text-sm">{t('template_upload_logo_text')}</span>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <img
                      src={customLogoBase64}
                      alt="Logo preview"
                      className="max-h-20 object-contain"
                    />
                  </div>
                )}
              </div>

              {customLogoBase64 && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('template_label_logo_position')}
                  </label>
                  <select
                    value={logoPosition}
                    onChange={(e) => setLogoPosition(e.target.value as 'top-left' | 'top-right' | 'top-center')}
                    className="w-full p-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="top-left">{t('template_pos_top_left')}</option>
                    <option value="top-right">{t('template_pos_top_right')}</option>
                    <option value="top-center">{t('template_pos_center')}</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('template_section_typography')}
              </h3>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value as 'helvetica' | 'times' | 'courier')}
                className="w-full p-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="helvetica">{t('template_font_helvetica')}</option>
                <option value="times">{t('template_font_times')}</option>
                <option value="courier">{t('template_font_courier')}</option>
              </select>
            </div>
          </div>

          <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex gap-3">
              <Button
                onClick={() => handleDownload('pdf')}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? t('template_status_generating') : t('template_btn_save_pdf')}
              </Button>
              <Button
                onClick={() => handleDownload('word')}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? t('template_status_generating') : t('template_btn_save_word')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}