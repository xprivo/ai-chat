import { SETUP_CONFIG } from '../config/setup';

interface CSRFTokenResponse {
  token_expiry: number;
  csrfToken: string;
}

interface CSRFToken {
  token: string;
  expiry: number;
}

const CSRF_STORAGE_KEY = 'csrfToken';

export class CSRFManager {
  private static instance: CSRFManager;
  private currentToken: CSRFToken | null = null;

  private constructor() {
    this.loadTokenFromStorage();
  }

  public static getInstance(): CSRFManager {
    if (!CSRFManager.instance) {
      CSRFManager.instance = new CSRFManager();
    }
    return CSRFManager.instance;
  }

  private loadTokenFromStorage(): void {
    if (!SETUP_CONFIG.csrf.enabled) return;

    try {
      const stored = localStorage.getItem(CSRF_STORAGE_KEY);
      if (stored) {
        this.currentToken = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading token from storage:', error);
      this.currentToken = null;
    }
  }

  private saveTokenToStorage(token: CSRFToken): void {
    try {
      localStorage.setItem(CSRF_STORAGE_KEY, JSON.stringify(token));
    } catch (error) {
      console.error('Error saving token to storage:', error);
    }
  }

  private isTokenExpired(): boolean {
    if (!this.currentToken) {
      return true;
    }

    const now = Date.now();
    const isExpired = now >= this.currentToken.expiry;
    
    return isExpired;
  }

  public async getValidToken(): Promise<string | null> {
    if (!SETUP_CONFIG.csrf.enabled) {
      return null;
    }

    if (this.currentToken && !this.isTokenExpired()) {
      return this.currentToken.token;
    }

    return await this.fetchNewToken();
  }

  private async fetchNewToken(): Promise<string | null> {
    try {
    
      const response = await fetch(SETUP_CONFIG.csrf.tokenEndpoint, {
        method: 'GET',
        credentials: 'include', // Important for HttpOnly cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`CSRF token request failed: ${response.status}`);
      }

      const data: CSRFTokenResponse = await response.json();
      
      this.currentToken = {
        token: data.csrfToken,
        expiry: data.token_expiry
      };

      this.saveTokenToStorage(this.currentToken);
      
      return this.currentToken.token;
      
    } catch (error) {
      console.error('Error fetching token:', error);
      this.currentToken = null;
      return null;
    }
  }

  public async getCSRFHeaders(): Promise<Record<string, string>> {
    if (!SETUP_CONFIG.csrf.enabled) {
      return {};
    }

    const token = await this.getValidToken();
    if (!token) {
      console.warn('No valid token available for request');
      return {};
    }

    return {
      'X-CSRF-Token': token
    };
  }

  public async refreshToken(): Promise<void> {
    if (!SETUP_CONFIG.csrf.enabled) return;
    await this.fetchNewToken();
  }
}