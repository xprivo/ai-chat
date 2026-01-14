import { Capacitor } from '@capacitor/core';

let configurationPromise: Promise<void> | null = null;

export async function configureRevenueCat(apiKey: string, appUserID?: string): Promise<void> {
  // Mock configuration - just set the promise to resolved
  configurationPromise = Promise.resolve();
  return configurationPromise;
}

async function ensureConfigured(): Promise<void> {
  // Mock - always configured
  return;
}

export async function loginUserAnonym(appUserID: string): Promise<boolean> {
  return false;
}

export function isConfigured(): boolean {
  return true; // Always return true
}

export async function getOfferings(): Promise<any | null> {
  return null; // Mock - no offerings
}

export async function getProProductPrice(): Promise<string | null> {
  return '$9.99'; // Mock price - change to whatever you want
}

export async function purchaseProSubscription(): Promise<{ success: boolean; customerInfo?: any; error?: any }> {
  // Mock successful purchase
  return { 
    success: true,
    customerInfo: { mockData: true }
  };
}

export async function restorePurchases(): Promise<{ success: boolean; customerInfo?: any; error?: any }> {
  // Mock successful restore
  return {
    success: true,
    customerInfo: { mockData: true }
  };
}

export async function getCustomerInfo(): Promise<any | null> {
  // Mock customer info
  return {
    originalAppUserId: 'mock-user-id',
    entitlements: { active: {} } // Empty entitlements = not pro
  };
}

export async function getAppUserID(): Promise<string | null> {
  return 'mock-user-id'; // Mock user ID
}

export async function checkProSubscriptionStatus(): Promise<boolean> {
  return false; // Mock as non-pro user (change to true if you want to test as pro)
}