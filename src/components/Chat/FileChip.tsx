import React, { useState } from 'react';
import { FileText, FileSpreadsheet, File, X } from 'lucide-react';
import { FileReference } from '../../types';
import { Modal } from '../UI/Modal';

interface FileChipProps {
  file: FileReference;
}

export function FileChip({ file }: FileChipProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getIcon = () => {
    switch (file.type) {
      case 'pdf':
        return <FileText size={14} className="text-red-500" />;
      case 'csv':
      case 'excel':
        return <FileSpreadsheet size={14} className="text-green-500" />;
      default:
        return <File size={14} className="text-blue-500" />;
    }
  };

  const getTypeLabel = () => {
    return file.type.toUpperCase();
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        {getIcon()}
        <span>{file.name}</span>
        <span className="text-xs opacity-70">{getTypeLabel()}</span>
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${file.name} (${getTypeLabel()})`}
      >
        <div className="relative max-h-96 overflow-auto">
          <div className="pr-4">
            <pre className="whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-hidden">
              {file.content}
            </pre>
          </div>
        </div>
      </Modal>
    </>
  );
}