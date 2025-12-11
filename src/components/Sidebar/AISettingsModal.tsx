import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, RotateCcw, Check } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAISettings } from '../../hooks/useLocalStorage';
import { AIEndpoint, AISettings } from '../../types';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Portal } from '../UI/Portal';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
 
export function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
  const { t } = useTranslation();
  const { aiSettings, saveAISettings } = useAISettings();
  const [localSettings, setLocalSettings] = useState<AISettings>(aiSettings);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    setLocalSettings(aiSettings);
  }, [aiSettings]);

  const handleSave = () => {
    saveAISettings(localSettings);
    
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    const defaultSettings: AISettings = {
      endpoints: [
        {
          id: 'default',
          name: 'xPrivo (llama / mistral /  gpt-oss)',
          url: 'https://www.xprivo.com/v1/chat/completions',
          authorization: 'Bearer API_KEY_XPRIVO',
          models: ['xprivo'],
          enableWebSearch: false, 
          enableSafeWebSearch: true // Safe web search enabled by default
        }
      ],
      selectedModel: 'xprivo'
    };
    setLocalSettings(defaultSettings);
  };

  const addEndpoint = () => {
    if (localSettings.endpoints.length >= 5) return;
    
    const newEndpoint: AIEndpoint = {
      id: Date.now().toString(),
      name: '',
      url: 'https://api.example.com/v1/chat/completions',
      authorization: 'Bearer your_api_key',
      models: ['']
    };
    
    setLocalSettings({
      ...localSettings,
      endpoints: [newEndpoint, ...localSettings.endpoints]
    });
  };

  const removeEndpoint = (endpointId: string) => {
    if (localSettings.endpoints.length <= 1) return; // Keep at least one endpoint
    
    const updatedEndpoints = localSettings.endpoints.filter(ep => ep.id !== endpointId);
    
    // If the selected model was from this endpoint, reset to first available model
    const removedEndpoint = localSettings.endpoints.find(ep => ep.id === endpointId);
    let newSelectedModel = localSettings.selectedModel;
    
    if (removedEndpoint?.models.includes(localSettings.selectedModel)) {
      newSelectedModel = updatedEndpoints[0]?.models[0] || 'gpt-4o-mini';
    }
    
    setLocalSettings({
      ...localSettings,
      endpoints: updatedEndpoints,
      selectedModel: newSelectedModel
    });
  };

  const updateEndpoint = (endpointId: string, updates: Partial<AIEndpoint>) => {
    setLocalSettings({
      ...localSettings,
      endpoints: localSettings.endpoints.map(ep =>
        ep.id === endpointId ? { ...ep, ...updates } : ep
      )
    });
  };

  const addModel = (endpointId: string) => {
    const endpoint = localSettings.endpoints.find(ep => ep.id === endpointId);
    if (!endpoint || endpoint.models.length >= 5) return;
    
    updateEndpoint(endpointId, {
      //was this before `new-model-${Date.now()}
      models: [...endpoint.models, ``]
    });
  };

  const removeModel = (endpointId: string, modelIndex: number) => {
    const endpoint = localSettings.endpoints.find(ep => ep.id === endpointId);
    if (!endpoint || endpoint.models.length <= 1) return; // Keep at least one model
    
    const updatedModels = endpoint.models.filter((_, index) => index !== modelIndex);
    const removedModel = endpoint.models[modelIndex];
    
    // If the removed model was selected, reset to first available model
    let newSelectedModel = localSettings.selectedModel;
    if (removedModel === localSettings.selectedModel) {
      // Find first available model from any endpoint
      const allRemainingModels = localSettings.endpoints.flatMap(ep => 
        ep.id === endpointId ? updatedModels : ep.models
      );
      newSelectedModel = allRemainingModels[0] || 'gpt-4o-mini';
    }
    
    updateEndpoint(endpointId, { models: updatedModels });
    setLocalSettings(prev => ({
      ...prev,
      selectedModel: newSelectedModel
    }));
  };

  const updateModel = (endpointId: string, modelIndex: number, newModelName: string) => {
    const endpoint = localSettings.endpoints.find(ep => ep.id === endpointId);
    if (!endpoint) return;
    
    const oldModelName = endpoint.models[modelIndex];
    const updatedModels = endpoint.models.map((model, index) =>
      index === modelIndex ? newModelName : model
    );
    
    // If the updated model was selected, update the selected model
    let newSelectedModel = localSettings.selectedModel;
    if (oldModelName === localSettings.selectedModel) {
      newSelectedModel = newModelName;
    }
    
    updateEndpoint(endpointId, { models: updatedModels });
    setLocalSettings(prev => ({
      ...prev,
      selectedModel: newSelectedModel
    }));
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[10001] flex items-center justify-center p-4 sm:p-6"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
        onClick={onClose}
      >
        <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[800px] max-w-[90vw] flex flex-col max-h-[85dvh] sm:max-h-[90dvh]"
            style={{
              maxHeight: 'calc(100dvh - 3rem)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t('aiSettings')}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 p-4 sm:p-6 overflow-auto">
            <div className="space-y-6">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">{t('aiProvidersModels')}</h3>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      onClick={addEndpoint}
                      disabled={localSettings.endpoints.length >= 5}
                      size="sm"
                      variant="outline"
                    >
                      <Plus size={16} className="mr-1" />
                      {t('addProvider')}
                    </Button>
                    <Button
                      onClick={handleReset}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                    >
                      <RotateCcw size={16} className="mr-1" />
                      {t('reset')}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {localSettings.endpoints.map((endpoint, endpointIndex) => (
                    <div key={endpoint.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                          {t('addProvider')} {endpointIndex + 1}
                        </h4>
                        {localSettings.endpoints.length > 1 && (
                          <button
                            onClick={() => removeEndpoint(endpoint.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input
                          label={t('providerName')}
                          value={endpoint.name}
                          onChange={(e) => updateEndpoint(endpoint.id, { name: e.target.value })}
                          placeholder={t('providerName')}
                        />
                        <Input
                          label={t('endpointUrl')}
                          value={endpoint.url}
                          onChange={(e) => updateEndpoint(endpoint.id, { url: e.target.value })}
                          placeholder={t('endpointUrl')}
                        />
                      </div>

                      <div className="mb-4">
                        <Input
                          label={t('authorization')}
                          value={endpoint.authorization}
                          onChange={(e) => updateEndpoint(endpoint.id, { authorization: e.target.value })}
                          placeholder={t('authorization')}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('models')}
                          </label>
                          <button
                            onClick={() => addModel(endpoint.id)}
                            disabled={endpoint.models.length >= 5}
                            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus size={14} className="inline mr-1" />
                            {t('addModel')}
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {endpoint.models.map((model, modelIndex) => (
                            <div key={modelIndex} className="flex items-center gap-2">
                              <Input
                                value={model}
                                onChange={(e) => updateModel(endpoint.id, modelIndex, e.target.value)}
                                placeholder={t('selectModel')}
                                className="flex-1"
                              />
                              {endpoint.models.length > 1 && (
                                <button
                                  onClick={() => removeModel(endpoint.id, modelIndex)}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={endpoint.enableSafeWebSearch || false}
                            onChange={(e) => {
                              const isEnabled = e.target.checked;
                              updateEndpoint(endpoint.id, { 
                                enableSafeWebSearch: isEnabled,
                                enableWebSearch: isEnabled ? false : (endpoint.enableWebSearch || false)
                              });
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            {t('enableSafeWebSearch')}
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                          {t('enableSafeWebSearchDescription')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center justify-end p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
            {showSuccessMessage && (
              <div className="flex items-center gap-2 mr-auto text-green-600 dark:text-green-400">
                <Check size={16} />
                <span className="text-sm font-medium">{t('successfullySaved')}</span>
              </div>
            )}
            <Button onClick={handleSave}>
              {t('saveSettings')}
            </Button>
          </div>
        </div>
      </div>
    </Portal> 
  );
}