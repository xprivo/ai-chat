import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Upload, X, File, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { extractTextFromFile, getFileTypeFromName } from '../../utils/fileProcessor';
import { FileReference } from '../../types';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { getPendingDroppedFile } from '../Chat/ChatInput';

interface FileProcessorProps {
  onFileProcessed: (file: FileReference) => void;
  onClose: () => void;
  existingFileNames: string[];
  chatId: string;
}

export function FileProcessor({ onFileProcessed, onClose, existingFileNames, chatId }: FileProcessorProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(Capacitor.isNativePlatform());
  }, []);

  useEffect(() => {
    const processDroppedFile = (file: File) => {
      setSelectedFile(file);
      const baseName = file.name.split('.')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      setFileName(baseName);
      setError('');
      setSuccess(false);
      setProcessingStatus('');
    };

    const pendingFile = getPendingDroppedFile();
    if (pendingFile) {
      processDroppedFile(pendingFile);
    }

    const handleFileDropped = (event: CustomEvent) => {
      const file = event.detail as File;
      if (file) {
        processDroppedFile(file);
      }
    };

    window.addEventListener('fileDropped', handleFileDropped as EventListener);
    return () => {
      window.removeEventListener('fileDropped', handleFileDropped as EventListener);
    };
  }, []);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Generate initial filename without extension and spaces
    const baseName = file.name.split('.')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    setFileName(baseName);
    setError('');
    setSuccess(false);
    setProcessingStatus('');
  };

  const validateFileName = (name: string): string | null => {
    if (!name.trim()) {
      return t('fileNameCannotBeEmpty');
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      return t('fileNameInvalidChars');
    }
    
    if (existingFileNames.includes(name)) {
      return t('fileAlreadyExists');
    }
    
    return null;
  };

  const processFile = async () => {
    if (!selectedFile || !fileName.trim()) return;

    const validationError = validateFileName(fileName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError('');
    setProcessingStatus(t('initializing'));

    try {
      // Update status based on file type
      const fileType = getFileTypeFromName(selectedFile.name);
      switch (fileType) {
        case 'pdf':
          setProcessingStatus(t('extractingTextFromPdf'));
          break;
        case 'excel':
          setProcessingStatus(t('processingExcelSpreadsheet'));
          break;
        case 'doc':
          setProcessingStatus(t('extractingTextFromWord'));
          break;
        default:
          setProcessingStatus(t('processingFile'));
      }
      
      const content = await extractTextFromFile(selectedFile);
      
      // Check if content extraction was successful
      if (!content || content.length < 1) {
        setError(t('notPossibleToExtractContent'));
        setIsProcessing(false);
        return;
      }

      if (content.length > 80000) {
        setError(t('fileSizeTooBig'));
        setIsProcessing(false);
        return;
      }

      setProcessingStatus(t('finalizing'));

      const fileRef: FileReference = {
        id: Date.now().toString(),
        name: fileName.trim(),
        type: fileType,
        content
      };

      onFileProcessed(fileRef);
      setSuccess(true);
      
      // Auto-add mention to chat input after successful processing
      setTimeout(() => {
        if ((window as any).addMentionToInput) {
          (window as any).addMentionToInput(fileName.trim());
        }
        onClose();
      }, 1000);
    } catch (err) {
      console.error('File processing error:', err);
      setError(err instanceof Error ? err.message : t('notPossibleToExtractContent'));
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          {t('fileProcessed')}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {t('fileContentExtracted')}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
          {t('chat_addingFileToChat', { fileName: fileName })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          onDragOver={!isMobile ? handleDragOver : undefined}
          onDragLeave={!isMobile ? handleDragLeave : undefined}
          onDrop={!isMobile ? handleDrop : undefined}
          className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          {!isMobile && (
            <>
              <Upload size={36} className="mx-auto text-gray-400 mb-3 sm:w-12 sm:h-12 sm:mb-4" />
              <p className="text-base sm:text-lg font-medium mb-2">
                {t('dragDropFiles')}
              </p>
            </>
          )}
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
            {t('supportedFormats')}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 sm:mb-4">
            {t('advancedTextExtraction')}
          </p>
          <input
            type="file"
            onChange={handleFileInput}
            accept=".pdf,.csv,.xlsx,.xls,.docx,.doc,.txt"
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm"
          >
            {t('browseFiles')}
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <File size={20} className="text-gray-500" />
            <span className="flex-1 text-xs sm:text-sm text-gray-900 dark:text-white truncate">
              {selectedFile.name}
            </span>
            <span className="text-xs text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
            <button
              onClick={() => {
                setSelectedFile(null);
                setFileName('');
                setError('');
                setProcessingStatus('');
              }}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X size={16} />
            </button>
          </div>

          <Input
            label={t('fileName')}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder={t('enterFileName')}
            error={error}
            disabled={isProcessing}
          />

          {isProcessing && processingStatus && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">{processingStatus}</span>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="font-medium mb-1">{t('fileProcessingFeatures')}</p>
            <p>{t('pdfExtraction')}</p>
            <p>{t('excelExtraction')}</p>
            <p>{t('wordExtraction')}</p>
            <p>{t('textCsvExtraction')}</p>
            <p className="mt-2 text-xs">{t('fileNameRestriction')}</p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              {t('cancel')}
            </Button>
            <Button
              onClick={processFile}
              disabled={!fileName.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                t('create')
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}