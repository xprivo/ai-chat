import { Capacitor } from '@capacitor/core';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';

let isListenerAdded = false;
let currentKeyboardHeight = 0;

export async function setupKeyboardHandler() {
  if (!Capacitor.isNativePlatform() || isListenerAdded) {
    return;
  }

  isListenerAdded = true;
  const isAndroid = Capacitor.getPlatform() === 'android';

  if (isAndroid) {
    try {
      await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
    } catch (_e) {
    }

    Keyboard.addListener('keyboardDidShow', (info) => {
      currentKeyboardHeight = info.keyboardHeight;
    });

    Keyboard.addListener('keyboardDidHide', () => {
      currentKeyboardHeight = 0;
    });
  } else {
    Keyboard.addListener('keyboardWillShow', (info) => {
      currentKeyboardHeight = info.keyboardHeight;
      const inputContainer = document.querySelector('.chat-input-container') as HTMLElement;
      if (inputContainer) {
        inputContainer.style.transform = `translateY(-${info.keyboardHeight}px)`;
        inputContainer.style.transition = 'transform 0.1s ease-out';
      }
    });

    Keyboard.addListener('keyboardWillHide', () => {
      currentKeyboardHeight = 0;
      const inputContainer = document.querySelector('.chat-input-container') as HTMLElement;
      if (inputContainer) {
        inputContainer.style.transform = 'translateY(0)';
        inputContainer.style.transition = 'transform 0.1s ease-out';
      }
    });
  }
}

export function cleanupKeyboardHandler() {
  if (Capacitor.isNativePlatform()) {
    Keyboard.removeAllListeners();
    isListenerAdded = false;
    currentKeyboardHeight = 0;
  }
}

export function getCurrentKeyboardHeight(): number {
  return currentKeyboardHeight;
}
