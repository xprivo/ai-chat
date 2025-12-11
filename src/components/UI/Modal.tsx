import React from 'react';
import { X } from 'lucide-react';
import { Portal } from './Portal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
 
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[10000] overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4"
        style={{
          paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))'
        }}
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[800px] max-w-[90vw] max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors bg-white dark:bg-gray-800 rounded-full shadow-sm"
          >
            <X size={20} />
          </button>
          
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white pr-8">{title}</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
}