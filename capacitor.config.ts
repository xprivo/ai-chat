import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xprivo.ai',
  appName: 'xPrivo - Private AI Chat',
  webDir: 'dist',
  server: {
    cleartext: true,
    androidScheme: 'https'
  },
  ios: {
    limitsNavigationsToAppBoundDomains: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    Keyboard: {
      resize: 'none',
      style: 'dark',
      resizeOnFullScreen: false
    }
  }
};

export default config;
