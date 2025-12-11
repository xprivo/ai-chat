import React, { useState, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { Portal } from '../UI/Portal';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  aiSettings: AISettings;
}
 
export function ModelSelector({ selectedModel, onModelChange, aiSettings }: ModelSelectorProps) {
  const [showModelSelector, setShowModelSelector] = useState(false);

  // Get all available models with their provider info
  const getAllModels = () => {
    return aiSettings.endpoints.flatMap(endpoint =>
      endpoint.models.map(model => ({
        model,
        provider: endpoint.name,
        endpointId: endpoint.id
      }))
    );
  };

  const allModels = getAllModels();

  const handleModelSelect = (model: string) => {
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
                      {endpoint.models.map((model) => (
                        <button
                          key={model}
                          onClick={() => handleModelSelect(model)}
                          className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <span className="text-sm text-gray-900 dark:text-white">
                            {model}
                          </span>
                          {selectedModel === model && (
                            <Check size={16} className="text-blue-600 dark:text-blue-400" />
                          )}
                        </button>
                      ))}
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
    </>
  );
}