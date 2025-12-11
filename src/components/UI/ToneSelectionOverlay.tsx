import React, { useState, useEffect } from 'react';
import { X, Check, SkipForward, MessageCircle, Heart, Briefcase, UserRound, Zap } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface Tone {
  id: string;
  title: string;
  description: string;
  icon: string;
  instruction: string;
}

interface ToneSelectionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  selectedToneId?: string;
  onSelectTone: (toneId: string | null) => void;
  showContinueButton?: boolean;
  isFirstTimeSetup?: boolean;
}

const tones: Tone[] = [
  {
    id: 'standard',
    title: 'Standard',
    description: 'Will give you normal non personalised answers',
    icon: 'MessageCircle',
    instruction: ''
  },
  {
    id: 'empathetic',
    title: 'Empathetic & understanding',
    description: 'Like talking to a therapist - non-judgmental, reflective, and supportive',
    icon: 'Heart',
    instruction: 'You are empathetic and understanding. Respond in a non-judgmental, reflective, and supportive manner, similar to how a psychotherapist would communicate. Show genuine care and validate the user\'s feelings while providing thoughtful guidance. Use emojis where needed and use paragraphs with titles if useful. Try finishing your response with a final question to better understand the person and to be able to go deeper and to continue the conversation.'
  },
  {
    id: 'professional',
    title: 'Professional & efficient',
    description: 'Business-focused - clear, concise, and results-oriented',
    icon: 'Briefcase',
    instruction: 'Be direct and business-focused. Prioritize clarity and actionable insights. Keep responses concise without unnecessary elaboration.'
  },
  {
    id: 'concise',
    title: 'Concise & immediate',
    description: 'Quick answers with essential information only',
    icon: 'Zap',
    instruction: 'Provide the most concise answer possible while including all essential information. Be direct and get straight to the point.'
  },
  {
    id: 'casual',
    title: 'Casual & friendly',
    description: 'Relaxed and conversational - like chatting with a helpful friend',
    icon: 'UserRound',
    instruction: 'Be warm and conversational, like a helpful friend. Use a relaxed, approachable tone while staying informative and supportive.'
  }
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'MessageCircle':
      return MessageCircle;
    case 'Heart':
      return Heart;
    case 'Briefcase':
      return Briefcase;
    case 'Zap':
      return Zap;
    case 'UserRound':
      return UserRound;
    default:
      return MessageCircle;
  }
};

export function ToneSelectionOverlay({
  isOpen,
  onClose,
  selectedToneId,
  onSelectTone,
  showContinueButton = false,
  isFirstTimeSetup = false
}: ToneSelectionOverlayProps) {
  const { t } = useTranslation();
  const [localSelectedToneId, setLocalSelectedToneId] = useState<string | undefined>(selectedToneId || 'standard');

  useEffect(() => {
    if (isOpen) {
      setLocalSelectedToneId(selectedToneId || 'standard');
    }
  }, [isOpen, selectedToneId]);

  if (!isOpen) return null;

  const handleToneClick = (toneId: string) => {
    if (toneId === 'standard') {
      setLocalSelectedToneId('standard');
    } else {
      setLocalSelectedToneId(toneId);
    }
  };

  const handleSkipOrSave = () => {
    if (localSelectedToneId === 'standard') {
      onSelectTone(null);
    } else {
      onSelectTone(localSelectedToneId || null);
    }
    onClose();
  };

  const handleContinue = () => {
    if (localSelectedToneId === 'standard') {
      onSelectTone(null);
    } else {
      onSelectTone(localSelectedToneId || null);
    }
    onClose();
  };

  const handleBackdropClick = () => {
    if (!isFirstTimeSetup) {
      onClose();
    }
  };
   
  const isContinueEnabled = true;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[10001] flex items-center justify-center p-4" onClick={handleBackdropClick}>
       <div
         className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-[1000px] max-h-[90vh] flex flex-col"
         onClick={(e) => e.stopPropagation()}
       >
         <div className="flex items-start justify-between gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
           <div className="flex-1 min-w-0">
             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
               {t('personalisation_title_question')}
             </h2>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('personalisation_subtitle')}
             </p>
           </div>
           <button
             onClick={onClose}
             className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full flex-shrink-0"
           >
             <X size={20} />
           </button>
         </div>

         <div className="flex-1 overflow-y-auto px-4 py-4">
           <div className="space-y-2">
             {tones.map((tone) => {
               const IconComponent = getIconComponent(tone.icon);
               const isSelected = localSelectedToneId === tone.id;

               // Dynamically generating the translation key based on the ID.
               // e.g., 'standard' -> 'tone_standard_title'
               const translatedTitle = t(`tone_${tone.id}_title`);
               const translatedDesc = t(`tone_${tone.id}_desc`);

               return (
                 <div
                   key={tone.id}
                   className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                     isSelected
                       ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                       : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                   }`}
                   onClick={() => handleToneClick(tone.id)}
                 >
                   <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                     <IconComponent size={20} className="text-blue-600 dark:text-blue-400" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 break-words">
                       {translatedTitle} {tone.id === 'standard' && <small>({t('recommended_label')})</small>}
                     </h3>
                     <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 break-words">
                       {translatedDesc}
                     </p>
                   </div>
                   <button
                     className={`flex-shrink-0 w-8 h-8 min-w-[2rem] min-h-[2rem] aspect-square rounded-full flex items-center justify-center transition-colors ${
                       isSelected
                         ? 'bg-blue-600 text-white'
                         : 'border-2 border-gray-300 dark:border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-500'
                     }`}
                   >
                     {isSelected && <Check size={16} />}
                   </button>
                 </div>
               );
             })}
           </div>
         </div>

         <div className="p-4 border-t border-gray-200 dark:border-gray-700">
           {isFirstTimeSetup ? (
             <div className="flex flex-wrap justify-center gap-3">
               <button
                 onClick={() => { onSelectTone(null); onClose(); }}
                 className="flex items-center justify-center gap-2
                   bg-black text-white
                   dark:bg-gray-200 dark:text-black
                   hover:bg-gray-800
                   dark:hover:bg-gray-300
                   font-medium py-3 px-6 rounded-lg
                   transition-colors duration-200"
               >
                 <SkipForward className="w-5 h-5 flex-shrink-0" />
                  {t('skip_label')}
               </button>
               {showContinueButton && (
                 <button
                   onClick={handleContinue}
                   disabled={!isContinueEnabled}
                   className={`flex items-center justify-center gap-2
                     font-medium py-3 px-6 rounded-lg
                     transition-colors duration-200
                     ${isContinueEnabled
                         ? 'bg-blue-600 text-white hover:bg-blue-700'
                         : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                     }`}
                 >
                    {t('save')}
                 </button>
               )}
             </div>
           ) : (
             <button
               onClick={handleSkipOrSave}
               className="w-full flex items-center justify-center gap-2
                 bg-blue-600 text-white
                 hover:bg-blue-700
                 font-medium py-3 px-6 rounded-lg
                 transition-colors duration-200"
             >
                {t('save')}
             </button>
           )}
         </div>
       </div>
    </div>
  );
}

export { tones };