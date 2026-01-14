import { CSRFManager } from './csrf';
import { SETUP_CONFIG } from '../config/setup';

interface ChatAPIRequest {
  messages: any[];
  model: string;
  request_type?: string;
  endpoint: string;
  authorization: string;
  temperature?: number;
  max_tokens?: number;
  max_completion_tokens?: number;
  top_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  ads_token?: string;
  chat_language?: string;
}
 
interface SponsoredAd {
  id: string;
  sponsored_title: string;
  sponsored_desc_1: string;
  sponsored_desc_2: string;
  sponsored_notice: 'sponsored' | 'partner' | 'offer' | 'promoted';
  save_text: string;
  url: string;
  image: string;
  svg: string;
  advertiser_name: string;
}

type TranslationFunction = (key: string) => string;

export async function sendChatMessage(
  request: ChatAPIRequest,
  onMessage: (chunk: string) => void,
  onAdstoken: (adstoken: string) => void,
  onSponsoredContentTitle: (adstitle: string) => void,
  onSponsoredContent: (ads: SponsoredAd[]) => void,
  onError: (error: string) => void,
  onComplete: () => void,
  signal?: AbortSignal,
  t?: TranslationFunction
): Promise<void> {
  try {
    const getAIAuthorizationHeader = (authorization: string, endpointUrl: string): string => {
      const proKey = localStorage.getItem('pro_key');
      if (proKey) {
        try {
          const url = new URL(endpointUrl);
          if (url.hostname.startsWith('www.xprivo.com')) {
            return `Bearer ${proKey}`;
          }
        } catch (error) {
          console.error('Error parsing endpoint URL');
        }
      }
      return authorization;
    };

    // Get CSRF headers if enabled
    const csrfManager = CSRFManager.getInstance();
    const csrfHeaders = await csrfManager.getCSRFHeaders();
    
    const response = await fetch(request.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAIAuthorizationHeader(request.authorization, request.endpoint),
        ...csrfHeaders,
        ...(request.ads_token && { 'X-Ads-Token': request.ads_token }),
        ...(request.chat_language && { 'X-Lang-Chat': request.chat_language })
      },
      body: JSON.stringify({
        messages: request.messages,
        model: request.model,
        ...(SETUP_CONFIG.apiRequestConfig.add_temperature && 
        request.temperature !== undefined && 
        { temperature: request.temperature }),

        ...(SETUP_CONFIG.apiRequestConfig.add_request_type && 
        request.request_type && 
        { request_type: request.request_type }),
        ...(SETUP_CONFIG.apiRequestConfig.max_tokens !== undefined && 
            SETUP_CONFIG.apiRequestConfig.max_tokens !== null && 
            { max_tokens: SETUP_CONFIG.apiRequestConfig.max_tokens }),
        ...(SETUP_CONFIG.apiRequestConfig.max_completion_tokens !== undefined && 
            SETUP_CONFIG.apiRequestConfig.max_completion_tokens !== null && 
            { max_completion_tokens: SETUP_CONFIG.apiRequestConfig.max_completion_tokens }),
        ...(SETUP_CONFIG.apiRequestConfig.top_p !== undefined && 
            SETUP_CONFIG.apiRequestConfig.top_p !== null && 
            { top_p: SETUP_CONFIG.apiRequestConfig.top_p }),
        ...(SETUP_CONFIG.apiRequestConfig.presence_penalty !== undefined && 
            SETUP_CONFIG.apiRequestConfig.presence_penalty !== null && 
            { presence_penalty: SETUP_CONFIG.apiRequestConfig.presence_penalty }),
        ...(SETUP_CONFIG.apiRequestConfig.frequency_penalty !== undefined && 
            SETUP_CONFIG.apiRequestConfig.frequency_penalty !== null && 
            { frequency_penalty: SETUP_CONFIG.apiRequestConfig.frequency_penalty }),
        ...(SETUP_CONFIG.apiRequestConfig.stream !== undefined && 
            SETUP_CONFIG.apiRequestConfig.stream !== null && 
            { stream: SETUP_CONFIG.apiRequestConfig.stream })
      }),
      signal: signal 
    });

    if (!response.ok) {
      if (response.status === 400) {
        try {
          const errorData = await response.json();
          
          // Handle specific error cases with custom overlays
          if (errorData.message === 'wrong_key') {
            window.dispatchEvent(new CustomEvent('showErrorOverlay', {
              detail: {
                title: t ? t('errorOverlay_wrongKey_title') : 'Invalid Key',
                text: t ? t('errorOverlay_wrongKey_text') : 'The provided key is invalid.',
                showProButton: false,
                icon: 'warning'
              }
            }));
            onComplete();
            return;
          }

          if (errorData.message === 'show_not_pro_anymore') {
            window.dispatchEvent(new CustomEvent('showErrorOverlay', {
              detail: {
                title: t ? t('errorOverlay_proExpired_title') : 'Pro Expired',
                text: t ? t('errorOverlay_proExpired_text') : 'Your Pro subscription has expired.',
                showProButton: false,
                icon: 'warning'
              }
            }));
            onComplete();
            return;
          } 

          if (errorData.message === 'show_limit_pro_model_reached') {
            window.dispatchEvent(new CustomEvent('showErrorOverlay', {
              detail: {
                title: t ? t('errorOverlay_proModelLimit_title') : 'PRO model limit reached',
                text: t ? t('errorOverlay_proModelLimit_text') : 'You have used up all your PRO model requests. Use a model that is not marked with PRO to continue.',
                showProButton: false,
                icon: 'warning'
              }
            }));
            onComplete();
            return;
          }
          
          if (errorData.message === 'show_upgrade_pro') {
            window.dispatchEvent(new CustomEvent('showErrorOverlay', {
              detail: {
                title: t ? t('errorOverlay_proModel_title') : 'This is a PRO model',
                text: t ? t('errorOverlay_proModel_text') : 'Upgrade to PRO to use this model and unlock higher limits and no ads.',
                showProButton: false,
                icon: 'zap'
              }
            }));
            onComplete();
            return;
          }

          if (errorData.message === 'show_limit_reached_pro') {
            window.dispatchEvent(new CustomEvent('showErrorOverlay', {
              detail: {
                title: t ? t('errorOverlay_proLimitReached_title') : 'Limit Reached',
                text: t ? t('errorOverlay_proLimitReached_text') : 'You have reached your Pro usage limit.',
                showProButton: false,
                icon: 'warning'
              }
            }));
            onComplete();
            return;
          }

          if (errorData.message === 'limit_max_images') {
            window.dispatchEvent(new CustomEvent('showErrorOverlay', {
              detail: {
                title: t ? t('errorOverlay_tooManyImages_title') : 'Too Many Images',
                text: t ? t('errorOverlay_tooManyImages_text') : 'You have exceeded the maximum number of images.',
                showProButton: false,
                icon: 'warning'
              }
            }));
            onComplete();
            return;
          }

           if (errorData.message === 'limit_max_imagesize' || errorData.message === 'limit_max_total_imagesize') {
            window.dispatchEvent(new CustomEvent('showErrorOverlay', {
              detail: {
                title: t ? t('errorOverlay_imagesTooLarge_title') : 'Images Too Large',
                text: t ? t('errorOverlay_imagesTooLarge_text') : 'The images are too large.',
                showProButton: false,
                icon: 'warning'
              }
            }));
            onComplete();
            return;
          }

          if (errorData.message === 'show_daily_free_limit_reached') {
            window.dispatchEvent(new CustomEvent('showErrorOverlay', {
              detail: {
                title: t ? t('errorOverlay_freeLimitReached_title') : 'Free Limit Reached',
                text: t ? t('errorOverlay_freeLimitReached_text') : 'You have reached your daily free usage limit.',
                showProButton: true,
                icon: 'warning'
              }
            }));
            onComplete();
            return;
          }
          
          if (errorData.message === 'show_premium_suggestion') {
            window.dispatchEvent(new CustomEvent('showPremiumOverlay', { 
              detail: { type: 'premium_suggestion' }
            }));
            onComplete();
            return;
          }
          if (errorData.message === 'show_limit_reached') {
            window.dispatchEvent(new CustomEvent('showPremiumOverlay', { 
              detail: { type: 'limit_reached' }
            }));
            onComplete();
            return;
          }
        } catch (e) {
          // If JSON parsing fails, fall through to regular error handling
        }
      } 
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      if (signal?.aborted) { 
        onComplete(); 
        return; 
      } 

      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onComplete();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
              onMessage(parsed.choices[0].delta.content);
            }
            // Handle sponsored content
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.sponsored_content) {
              onSponsoredContentTitle(parsed?.choices?.[0]?.delta?.sponsored_content_title ?? '');
              onSponsoredContent(parsed?.choices?.[0]?.delta?.sponsored_content ?? []);
              onAdstoken(parsed?.choices?.[0]?.delta?.ads_token ?? '');
            }
            // Handle suggested premium content
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.suggested_premium_content) {
              window.dispatchEvent(new CustomEvent('showSuggestedPremium', { 
                detail: { content: parsed.choices[0].delta.suggested_premium_content }
              }));
            }
          } catch (e) {
            // Ignoring parsing errors for malformed chunks for now - * maybe we do it later
          }
        }
      }
    }
     
    onComplete();
    } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      onComplete();
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    if (errorMessage === 'Failed to fetch') {
      console.log('429 ERROR BLOCK IS RUNNING! (Note: Triggered by "Failed to fetch")');
      window.dispatchEvent(new CustomEvent('showErrorOverlay', {
          detail: {
            title: t ? t('errorOverlay_errorlimit_title') : 'Try again in a few minutes',
            text: t ? t('errorOverlay_errorlimit_text') : 'An error occured. Try again in a few minutes or in 1 hour.',
            showProButton: false,
            icon: 'warning'
          }
        }));
      onComplete();
      return;
    }
    onError(errorMessage, undefined);
  }
}