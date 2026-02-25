// Configuration file for setup users to customize default values
// Edit these values to customize the application for your deployment

export const SETUP_CONFIG = {
  // App branding
  appName: 'xPrivo',

  appVersion: '2.1.0',

  // Branding - Icon in the Menu
  menu_icon: '/assets/logo/xprivo-app.png',
  
  // Default AI provider settings
  defaultProvider: {
    name: 'xPrivo (llama / mistral /  gpt-oss)',
    url: 'https://www.xprivo.com/v1/chat/completions',
    authorization: 'Bearer API_KEY_XPRIVO',
    model: 'xprivo',
    enableWebSearch: false, 
    enableSafeWebSearch: true // Safe web search enabled by default
  },
  
  pro_switcher: 'banner' as 'off' | 'banner' | 'on',
  pro_switcher_website: "https://www.example.com",

  // Web Search Configuration
  webSearch: {
    endpoint: 'https://www.xprivo.com/v1/web/search', // The URL for your web search API
    country: '',
    add_lang: true // ads the current client language
    // Optional: If you have a static authorization token for web search, define it here.
    // Example: authorization: 'Bearer your_static_web_search_token',
    // If left undefined, the system will fall back to the dynamic authorization logic.
    // authorization: 'Bearer ...',
  },

  webSearchUsage: 'auto' as 'on' | 'off' | 'auto',

  // API Request Configuration
  // Control which parameters are sent to your AI endpoint
  apiRequestConfig: {
    // Temperature controls randomness (0.0 = focused, 2.0 = creative)
    // Set to false to not include temperature in requests - default true => to reflect the temperature in the chat setting
    add_temperature: true,

    // Set stream to true if want streaming back - false if no stream and null if do not want to include in request
    stream: true,
    
    // Request type field (provider-specific)
    // Set to false to never include request_type
    add_request_type: true,
    
    // Maximum tokens in the response
    // Leave empty (null) to not set a include it / no limit, or specify a number (e.g., 4096)
    max_tokens: null,
    
    // Maximum completion tokens (for some providers like OpenAI)
    // Leave empty (null) to use provider defaults
    max_completion_tokens: null,
    
    // Top-p nucleus sampling (0.0 to 1.0)
    // Controls diversity via nucleus sampling
    // Leave empty (null) to not include
    top_p: null,
    
    // Presence penalty (-2.0 to 2.0)
    // Positive values penalize new tokens based on whether they appear in the text so far
    // Leave empty (null) to not include
    presence_penalty: null,
    
    // Frequency penalty (-2.0 to 2.0)
    // Positive values penalize new tokens based on their frequency in the text so far
    // Leave empty (null) to not include
    frequency_penalty: null,

    version: 2
  },
  
  // CSRF Protection - if using accounts
  csrf: {
    enabled: false,
    tokenEndpoint: 'https://www.example.com/session/csrf-token'
  },
  
  // Legal links
  privacyPolicyUrl: 'https://www.xprivo.com/policy/privacy',//'https://www.example.com',
  termsOfServiceUrl: 'https://www.xprivo.com/policy/terms',//'https://www.example.com',
  imprintUrl: 'https://www.xprivo.com/policy/imprint',//'https://www.example.com',
  aboutUrl: 'https://www.xprivo.com/links/about-xprivo',

  invitation: 'on',

  search_auto_suggest: false,

  enterprise_button: true,

  add_ads_token: true,
  add_chat_language: true,
  
  // Consent banner settings
  consentBanner: {
    enabled: true
  },

  get_pro_models: true, // Should be false unless you show special PRO models

  show_search_engine: true,  //search engine button in sidebar - false for local deployment
  show_browser: true,        //mobile browser - false for local deployment

  show_protection_badge: true,  // Not serving over a privacy-first provider? Probably set the following to false
  show_made_europe: true,       // Not serving from EU set to false

  acceptConsentBanner: false, //important to make this true if you use non-functional cookies

  showWelcomePersonalisation: 'tone' as 'expert' | 'tone' | '',
  
  // Sponsored content settings
  get_sponsored_content: true
};