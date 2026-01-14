import React, { useState } from 'react';
import { FileText, X, Eye, AtSign, Image } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';

interface FileManagerProps {
  files: Record<string, string>;
  images: Record<string, string>;
  onMentionFile: (fileName: string) => void;
  onClose: () => void;
}
 
export function FileManager({ files, images, onMentionFile, onClose }: FileManagerProps) {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<{ name: string; content: string; type: 'file' | 'image' } | null>(null);
  const [showImageModal, setShowImageModal] = useState<{ name: string; content: string } | null>(null);

  // Extract file names from chat-specific keys
  const fileEntries = Object.entries(files).map(([key, content]) => {
    const fileName = key.split('_').slice(2).join('_'); // Remove chatId_file_ prefix
    return [fileName, content, 'file' as const];
  });

  // Extract image names from chat-specific keys
  const imageEntries = Object.entries(images).map(([key, content]) => {
    const imageName = key.split('_').slice(2).join('_'); // Remove chatId_image_ prefix
    return [imageName, content, 'image' as const];
  });

  const allEntries = [...fileEntries, ...imageEntries];

  if (allEntries.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          {t('noFilesInChat')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 max-h-96 overflow-auto">
        {allEntries.map(([name, content, type]) => (
          <div key={name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              {type === 'file' ? (
                <FileText size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Image size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white break-words leading-tight">
                  {name}
                </h3>
                <span className="inline-block text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 mt-2">
                  {type === 'file' ? t('file_solo') : t('image_solo')}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onMentionFile(name);
                  onClose();
                }}
                className="flex items-center justify-center gap-2 w-full"
              >
                <AtSign size={14} />
                <span>
                  {type === 'file' ? t('mentionFile') : t('mentionImage')}
                </span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (type === 'image') {
                    setShowImageModal({ name, content });
                  } else {
                    setSelectedFile({ name, content, type });
                  }
                }}
                className="flex items-center justify-center gap-2 w-full"
              >
                <Eye size={14} />
                <span>
                  {type === 'file' ? t('seeContent') : t('showImage')}
                </span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* File Content Modal */}
      <Modal
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        title={selectedFile?.name || ''}
      >
        <div className="p-4 sm:p-6 relative max-h-96 overflow-auto">
          <div className="pr-4">
            <pre className="whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-hidden">
              {selectedFile?.content || t('file_contentExtractionError')}
            </pre>
          </div>
        </div>
      </Modal>

      {/* Image Modal */}
      <Modal
        isOpen={!!showImageModal}
        onClose={() => setShowImageModal(null)}
        title={showImageModal?.name || ''}
      >
        <div className="p-4 sm:p-6 flex justify-center">
          <img
            src={showImageModal?.content}
            alt={showImageModal?.name}
            className="max-w-full max-h-96 rounded-lg"
          />
        </div>
      </Modal>
    </>
  );
}