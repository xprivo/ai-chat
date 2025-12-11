import React, { useState } from 'react';
import { Image } from 'lucide-react';
import { ImageReference } from '../../types';
import { Modal } from '../UI/Modal';

interface ImageChipProps {
  image: ImageReference;
}

export function ImageChip({ image }: ImageChipProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
      >
        <Image size={14} className="text-green-500" />
        <span>{image.name}</span>
        <span className="text-xs opacity-70">IMG</span>
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${image.name} (Image)`}
      >
        <div className="flex justify-center">
          <img
            src={image.content}
            alt={image.name}
            className="max-w-full max-h-96 rounded-lg"
          />
        </div>
      </Modal>
    </>
  );
}