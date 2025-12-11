import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

let isListenerAdded = false;
let currentKeyboardHeight = 0;

export function setupKeyboardHandler() {
  if (!Capacitor.isNativePlatform() || isListenerAdded) {
    return;
  }

  isListenerAdded = true;

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

export function cleanupKeyboardHandler() {
  if (Capacitor.isNativePlatform()) {
    Keyboard.removeAllListeners();
    isListenerAdded = false;
  }
}

export function getCurrentKeyboardHeight(): number {
  return currentKeyboardHeight;
}
