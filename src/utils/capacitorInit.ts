import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { migrateToCapacitorStorage } from './capacitorStorage';
import { configureRevenueCat } from './revenueCatDummy';
import { SETUP_CONFIG } from '../config/setup';

export async function initializeCapacitor(): Promise<void> {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {

    try {
      await migrateToCapacitorStorage();

      const platform = Capacitor.getPlatform();

      if (platform === 'ios') {
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
      } else if (platform === 'android' && !SETUP_CONFIG.isFoss) {
        const REVENUECAT_ANDROID_API_KEY = import.meta.env.VITE_REVENUECAT_ANDROID_API_KEY;
        if (REVENUECAT_ANDROID_API_KEY) {
          try {
            await configureRevenueCat(REVENUECAT_ANDROID_API_KEY);
          } catch (error) {
            console.error('Android RevenueCat configuration failed:', error);
          }
        } else {
          console.warn('Android app key not found in environment variables');
        }
      }

      App.addListener('appStateChange', (state) => {
        if (state.isActive) {
          //console.log('App resumed');
        } else {
          //console.log('App backgrounded');
        }
      });

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

export async function exitApp() {
  if (Capacitor.isNativePlatform()) {
    try {
      await App.exitApp();
    } catch (error) {
      console.error('Error exiting app:', error);
    }
  }
}
