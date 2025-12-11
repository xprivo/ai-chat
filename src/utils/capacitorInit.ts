import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { migrateToCapacitorStorage } from './capacitorStorage';
import { configureRevenueCat } from './revenueCatDummy';

export async function initializeCapacitor(): Promise<void> {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {

    try {
      // Migrate existing localStorage data to Capacitor Preferences
      await migrateToCapacitorStorage();

      // Configure RevenueCat for iOS in-app purchases
      if (Capacitor.getPlatform() === 'ios') {
        const REVENUECAT_IOS_API_KEY = import.meta.env.VITE_REVENUECAT_IOS_API_KEY;
        if (REVENUECAT_IOS_API_KEY) {
          try {
            await configureRevenueCat(REVENUECAT_IOS_API_KEY);
          } catch (error) {
            console.error('Configuration failed:', error);
          }
        } else {
          console.warn('iOS app key not found in environment variables');
        }
      }

      //for testing
      App.addListener('appStateChange', (state) => {
        if (state.isActive) {
          // App came to foreground
          //console.log('App resumed');
        } else {
          // App went to background
          //console.log('App backgrounded');
        }
      });

      // (deep linking)
      App.addListener('appUrlOpen', (event) => {
        //console.log('App opened with URL:', event.url);
      });

      App.addListener('backButton', (event) => {
        //console.log('Back button pressed', event);
      });

    } catch (error) {
      console.error('Error initializing Capacitor:', error);
    }
  } else {
    //console.log('Running in web browser');
  }
}

// Get app info
export async function getAppInfo() {
  if (Capacitor.isNativePlatform()) {
    try {
      const info = await App.getInfo();
      return info;
    } catch (error) {
      console.error('Error getting app info:', error);
      return null;
    }
  }
  return null;
}

// Exit app (useful for Android)
export async function exitApp() {
  if (Capacitor.isNativePlatform()) {
    try {
      await App.exitApp();
    } catch (error) {
      console.error('Error exiting app:', error);
    }
  }
}
