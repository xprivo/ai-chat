import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { capacitorStorage } from '../../utils/capacitorStorage';

interface AssistantIconProps {
  size: number;
}

export const AssistantIcon = ({ size }: AssistantIconProps) => {
  const [customIconUrl, setCustomIconUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      capacitorStorage.getItem('assistantIcon').then(val => {
        setCustomIconUrl(val);
      });
    } else {
      setCustomIconUrl(localStorage.getItem('assistantIcon'));
    }

    const handler = () => {
      if (Capacitor.isNativePlatform()) {
        capacitorStorage.getItem('assistantIcon').then(val => {
          setCustomIconUrl(val);
          setImageError(false);
        });
      } else {
        setCustomIconUrl(localStorage.getItem('assistantIcon'));
        setImageError(false);
      }
    };
    window.addEventListener('assistantIconUpdated', handler);
    return () => window.removeEventListener('assistantIconUpdated', handler);
  }, []);

  const handleError = () => {
    capacitorStorage.removeItem('assistantIcon');
    setImageError(true);
  };

  if (customIconUrl && !imageError) {
    return (
      <img
        src={customIconUrl}
        alt="Assistant"
        className="w-full h-full object-cover rounded-full"
        onError={handleError}
      />
    );
  }

  return <Bot size={size} />;
};
