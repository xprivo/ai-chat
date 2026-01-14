import React, { useState, useEffect } from 'react';
import { Camera, Image, Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import heic2any from 'heic2any';
import { useTranslation } from '../../hooks/useTranslation';
import { ImageReference } from '../../types';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { SETUP_CONFIG } from '../../config/setup';
import { storage } from '../../utils/storage';
import { Capacitor } from '@capacitor/core';

interface PhotoUploadProps {
    onImageProcessed: (image: ImageReference) => void;
    onClose: () => void;
    existingImageNames: string[];
    chatId: string;
}

/**
 * Component to display a prompt for users who need to sign up.
 */
const SignUpPrompt = ({ onClose, t }) => (
    <div className="text-center py-8">
        <Image size={36} className="mx-auto text-gray-400 mb-3 sm:w-12 sm:h-12 sm:mb-4" />
        <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">{t('signUpToIncludeImages')}</p>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 px-4">{t('clickMyAccountToUpgrade')}</p>
        <Button onClick={onClose} variant="outline">{t('cancel')}</Button>
    </div>
);

/**
 * Handles the file selection via drag-and-drop or file input.
 */
const FileDropzone = ({ onFileSelect, isDragging, setIsDragging, t }) => {

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(Capacitor.isNativePlatform());
    }, []);
  
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            onFileSelect(files[0]);
        }
    };
    const handleFileInput = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelect(files[0]);
        }
    };

    // Other potential solution - not using capacitor
    //const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    return (
        <div
            onDragOver={!isMobile ? handleDragOver : undefined}
            onDragLeave={!isMobile ? handleDragLeave : undefined}
            onDrop={!isMobile ? handleDrop : undefined}
            className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
            }`}
        >
            {!isMobile && (
                <>
                    <Upload size={36} className="mx-auto text-gray-400 mb-3 sm:w-12 sm:h-12 sm:mb-4" />
                    <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">{t('dragDropImages')}</p>
                </>
            )}
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">{t('supportedImageFormats')}</p>
            <div className="space-y-2 sm:space-y-3">
                <input type="file" onChange={handleFileInput} accept="image/*" className="hidden" id="image-input" />
                <label htmlFor="image-input" className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm">
                    <Image size={16} className="mr-2" />
                    {t('chooseFromLibrary')}
                </label>
                {isMobile && (
                    <div>
                        <button onClick={() => document.getElementById('image-input')?.click()} className="inline-flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                            <Camera size={16} className="mr-2" />
                            {t('takePhoto')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Shows the success message after image processing.
 */
const SuccessView = ({ imageName, t }) => (
    <div className="text-center py-8">
        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
        <p className="text-lg font-medium text-gray-900 dark:text-white">{t('imageProcessed')}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('imageReadyForChat')}</p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            {t('chat_addingImageToChat', { imageName: imageName })}
        </p>
    </div>
);

/**
 * Displays the image preview, but not for HEIC files.
 */
const ImagePreview = ({ file }) => {
    const isHeic = file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic');

    if (isHeic) {
        // Don't show a preview for HEIC files
        return null;
    }

    // For all other image types, show the preview
    return (
        <div className="flex justify-center">
            <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="max-w-full max-h-32 sm:max-h-48 rounded-lg border border-gray-300 dark:border-gray-600"
            />
        </div>
    );
};


const ImageProcessing = ({
    selectedFile,
    imageName,
    setImageName,
    isProcessing,
    processingStatus,
    error,
    onClearFile,
    processImage,
    onClose,
    t
}) => (
    <div className="space-y-4">
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Image size={20} className="text-gray-500" />
            <span className="flex-1 text-xs sm:text-sm text-gray-900 dark:text-white truncate">{selectedFile.name}</span>
            <span className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            <button onClick={onClearFile} className="text-gray-500 hover:text-gray-700 p-1">
                <X size={16} />
            </button>
        </div>

        {selectedFile && <ImagePreview file={selectedFile} />}

        <Input
            label={t('fileName')}
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
            placeholder={t('enterImageName')}
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
            <p className="font-medium mb-1">{t('imageProcessingFeatures')}</p>
            <p>{t('supportedImageFormatsDetailed')}</p>
            <p>{t('aiVisionAnalysis')}</p>
            <p>{t('mentionSystem')}</p>
            <p className="mt-2 text-xs">{t('imageNameRestriction')}</p>
        </div>

        <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>{t('cancel')}</Button>
            <Button onClick={processImage} disabled={!imageName.trim() || isProcessing}>
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
);

export function PhotoUpload({ onImageProcessed, onClose, existingImageNames, chatId }: PhotoUploadProps) {
    const { t } = useTranslation();
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageName, setImageName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');

    const [isSignedUp, setIsSignedUp] = useState(() => {
        switch (SETUP_CONFIG.pro_switcher) {
            case 'off':
            case 'banner': return true;
            case 'on':
            default: return false;
        }
    });

    useEffect(() => {
        const loadAccountStatus = async () => {
            if (SETUP_CONFIG.pro_switcher === 'off' || SETUP_CONFIG.pro_switcher === 'banner') {
                setIsSignedUp(true);
                return;
            }
            try {
                const stored = await storage.settings.get('accountStatus');
                setIsSignedUp(stored === 'pro');
            } catch (error) {
                console.error('Error loading account status:', error);
            }
        };

        const handleAccountStatusChange = () => {
            loadAccountStatus();
        };

        window.addEventListener('accountStatusChanged', handleAccountStatusChange);
        window.addEventListener('storage', handleAccountStatusChange);
        loadAccountStatus();

        return () => {
            window.removeEventListener('accountStatusChanged', handleAccountStatusChange);
            window.removeEventListener('storage', handleAccountStatusChange);
        };
    }, []);

    const clearSelectedFile = () => {
        setSelectedFile(null);
        setImageName('');
        setError('');
        setProcessingStatus('');
    };

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError(t('pleaseSelectImageFile'));
            return;
        }
        setSelectedFile(file);
        const baseName = file.name.split('.')[0].replace(/[^a-zA-Z0-9_]/g, '_');
        setImageName(baseName);
        setError('');
        setSuccess(false);
        setProcessingStatus('');
    };

    const validateImageName = (name: string): string | null => {
        if (!name.trim()) return t('imageNameCannotBeEmpty');
        if (!/^[a-zA-Z0-9_]+$/.test(name)) return t('imageNameInvalidChars');
        if (existingImageNames.includes(name)) return t('imageAlreadyExists');
        return null;
    };

    const processImage = async () => {
        if (!selectedFile || !imageName.trim()) return;

        const validationError = validateImageName(imageName);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsProcessing(true);
        setError('');
        setProcessingStatus(t('imageProcessing'));

        try {
            let fileToProcess = selectedFile;
            const isHeic = selectedFile.type === 'image/heic' || selectedFile.name.toLowerCase().endsWith('.heic');

            if (isHeic) {
                setProcessingStatus(t('convertingHeicFile'));
                const convertedBlob = await heic2any({
                    blob: selectedFile,
                    toType: 'image/png',
                });
                fileToProcess = new File([convertedBlob as BlobPart], `${imageName.trim()}.png`, { type: 'image/png' });
            }

            const reader = new FileReader();
            reader.onload = () => {
                const imageRef: ImageReference = {
                    id: Date.now().toString(),
                    name: imageName.trim(),
                    type: 'image',
                    content: reader.result as string,
                    mimeType: fileToProcess.type,
                };
                onImageProcessed(imageRef);
                setSuccess(true);
                setTimeout(() => {
                    if ((window as any).addMentionToInput) {
                        (window as any).addMentionToInput(imageName.trim());
                    }
                    onClose();
                }, 1000);
            };
            reader.onerror = () => {
                setError(t('failedToProcessImage'));
                setIsProcessing(false);
            };
            reader.readAsDataURL(fileToProcess);
        } catch (err) {
            console.error('Image processing error:', err);
            setError(t('failedToProcessImage'));
            setIsProcessing(false);
        }
    };

    const renderContent = () => {
        if (!isSignedUp) {
            return <SignUpPrompt onClose={onClose} t={t} />;
        }
        if (success) {
            return <SuccessView imageName={imageName} t={t} />;
        }
        if (selectedFile) {
            return (
                <ImageProcessing
                    selectedFile={selectedFile}
                    imageName={imageName}
                    setImageName={setImageName}
                    isProcessing={isProcessing}
                    processingStatus={processingStatus}
                    error={error}
                    onClearFile={clearSelectedFile}
                    processImage={processImage}
                    onClose={onClose}
                    t={t}
                />
            );
        }
        return (
            <FileDropzone
                onFileSelect={handleFileSelect}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                t={t}
            />
        );
    };

    return <div className="space-y-4">{renderContent()}</div>;
}