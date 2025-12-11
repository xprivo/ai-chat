import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';

interface AssistantIconProps {
  size: number;
}

export const AssistantIcon = ({ size }: AssistantIconProps) => {
  const [customIconUrl, setCustomIconUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setCustomIconUrl(localStorage.getItem('assistantIcon'));
  }, []);

  const handleError = () => {
    localStorage.removeItem('assistantIcon');
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