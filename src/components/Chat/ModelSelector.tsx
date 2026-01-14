import React, { useState, useEffect } from 'react';
import { ChevronDown, Check, X, Zap, Brain } from 'lucide-react';
import { Portal } from '../UI/Portal';
import { useTranslation } from '../../hooks/useTranslation';
import { AISettings } from '../../types';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  aiSettings: AISettings;
}
 
export function ModelSelector({ selectedModel, onModelChange, aiSettings }: ModelSelectorProps) {
  const { t } = useTranslation();
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showUpgradeOverlay, setShowUpgradeOverlay] = useState(false);
  const [hasProKey, setHasProKey] = useState(false);

  useEffect(() => {
    const checkProKey = () => {
      const proKey = localStorage.getItem('pro_key');
      setHasProKey(!!proKey);
    };
    checkProKey();
    window.addEventListener('storage', checkProKey);
    return () => window.removeEventListener('storage', checkProKey);
  }, []);

  const getAllModels = () => {
    return aiSettings.endpoints.flatMap(endpoint =>
      endpoint.models.map(model => ({
        model,
        provider: endpoint.name,
        endpointId: endpoint.id,
        metadata: endpoint.modelMetadata?.[model]
      }))
    );
  };

  const allModels = getAllModels();

  const handleModelSelect = (model: string, metadata?: any) => {
    if (metadata?.ispremium && !hasProKey) {
      setShowUpgradeOverlay(true);
      return;
    }
    onModelChange(model);
    setShowModelSelector(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModelSelector(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <span className="truncate max-w-32">
          {selectedModel}
        </span>
        <ChevronDown size={14} />
      </button>

      {/* Model Selection Modal */}
      {showModelSelector && (
        <Portal>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[10002] flex items-center justify-center p-4"
            onClick={() => setShowModelSelector(false)}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white"> {t('modelSelector_title')}</h3>
                <button
                  onClick={() => setShowModelSelector(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="overflow-auto max-h-[50vh]">
                {aiSettings.endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {endpoint.name}
                      </h4>
                    </div>
                    <div className="space-y-1 p-2">
                      {endpoint.models.map((model) => {
                        const metadata = endpoint.modelMetadata?.[model];
                        const isPremium = metadata?.ispremium || false;
                        const logoUrl = metadata?.logo_url || '';
                        const isReasoning = metadata?.reasoning || false;
                        const displayName = metadata?.name || model;

                        return (
                          <button
                            key={model}
                            onClick={() => handleModelSelect(model, metadata)}
                            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {logoUrl && (
                                <img
                                  src={logoUrl}
                                  alt={`${displayName} logo`}
                                  className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                                />
                              )}
                              <span className="text-sm text-gray-900 dark:text-white truncate">
                                {displayName}
                              </span>
                              {isReasoning && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 flex-shrink-0">
                                  <Brain size={12} />
                                  {t('reasoning_model')}
                                </span>
                              )}
                              {isPremium && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-orange-500/20 dark:text-orange-400 flex-shrink-0">
                                  <Zap size={12} />
                                  PRO
                                </span>
                              )}
                            </div>
                            {selectedModel === model && (
                              <Check size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              {allModels.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('modelSelector_noModelsConfigured')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Portal>
      )}

      {showUpgradeOverlay && (
       <Portal>
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10003] flex items-center justify-center p-4"
          onClick={() => setShowUpgradeOverlay(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-100 dark:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 transform transition-transform hover:rotate-6 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-[#d9a420] dark:to-[#bc890d]">
                <Zap size={32} className="text-white" fill="currentColor" />
              </div>
      
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                {t('pro_upgrade_title')}
              </h2>
      
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {t('pro_upgrade_description')}
              </p>
      
              <button
                onClick={() => {
                  setShowUpgradeOverlay(false);
                  window.dispatchEvent(new CustomEvent('showProOverlay'));
                }}
                className="w-full text-white font-bold py-3.5 px-6 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mb-4 shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 dark:from-[#d9a420] dark:to-[#bc890d]"
              >
                {t('pro_upgrade_cta')}
              </button>
      
              <button
                onClick={() => setShowUpgradeOverlay(false)}
                className="text-sm text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                {t('pro_upgrade_maybe_later')}
              </button>
            </div>
          </div>
        </div>
      </Portal>
      )}
    </>
  );
}